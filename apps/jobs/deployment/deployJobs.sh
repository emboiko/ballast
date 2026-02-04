#!/bin/bash
set -e

JOB_NAME=$1
ENVIRONMENT=$2
SCHEDULE_OVERRIDE=$3

if [ -z "$JOB_NAME" ] ; then
  echo "ERROR: Missing required option 'JOB_NAME'"
  exit 1
fi

if [ -z "$ENVIRONMENT" ] ; then
  echo "ERROR: Missing required option 'ENVIRONMENT'"
  exit 1
fi

AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-"240941311564"}
AWS_REGION=${AWS_REGION:-"us-east-1"}
JOB_QUEUE_NAME=${JOB_QUEUE_NAME:-"ballast-jobs-${ENVIRONMENT}"}
EXECUTION_ROLE_ARN=${AWS_BATCH_EXECUTION_ROLE_ARN:-"arn:aws:iam::240941311564:role/ecsTaskExecutionRole"}
JOB_ROLE_ARN=${AWS_BATCH_JOB_ROLE_ARN:-"arn:aws:iam::240941311564:role/ecsTaskExecutionRole"}
EVENTS_ROLE_ARN=${AWS_EVENTS_ROLE_ARN:-"arn:aws:iam::240941311564:role/service-role/AWS_Events_Invoke_Batch_Job_Queue_1444546103"}

JOB_COMMAND=""
SCHEDULE_EXPRESSION=""
MEMORY_VALUE=2048
VCPU_VALUE=0.25

case $JOB_NAME in
  "charge-financing-plans")
    JOB_COMMAND="/app/scripts/financing/runChargeFinancing.js"
    SCHEDULE_EXPRESSION="cron(0 13 * * ? *)"
    ;;
  "charge-subscriptions")
    JOB_COMMAND="/app/scripts/subscriptions/runChargeSubscriptions.js"
    SCHEDULE_EXPRESSION="cron(0 14 * * ? *)"
    ;;
  *)
    echo "ERROR: Unknown job name '$JOB_NAME'"
    exit 1
    ;;
esac

if [ -n "$SCHEDULE_OVERRIDE" ] ; then
  SCHEDULE_EXPRESSION="$SCHEDULE_OVERRIDE"
fi

ECR_REPOSITORY="${JOB_NAME}-${ENVIRONMENT}"
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:latest"

echo "Deploying '${JOB_NAME}' for environment '${ENVIRONMENT}'"

echo "Logging into ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "Ensuring ECR repository exists: ${ECR_REPOSITORY}"
aws ecr describe-repositories --repository-names "${ECR_REPOSITORY}" --region "${AWS_REGION}" || aws ecr create-repository --repository-name "${ECR_REPOSITORY}" --region "${AWS_REGION}"

echo "Building Docker image..."
docker build -f Dockerfile -t "${ECR_REPOSITORY}" .

echo "Pushing Docker image to ECR..."
docker tag "${ECR_REPOSITORY}:latest" "${ECR_URI}"
docker push "${ECR_URI}"

echo "Registering job definition..."
aws batch register-job-definition \
  --job-definition-name "${JOB_NAME}-${ENVIRONMENT}" \
  --type container \
  --platform-capabilities "FARGATE" \
  --container-properties '{
    "image":"'"${ECR_URI}"'",
    "executionRoleArn":"'"${EXECUTION_ROLE_ARN}"'",
    "jobRoleArn":"'"${JOB_ROLE_ARN}"'",
    "resourceRequirements":[
      {"type":"MEMORY","value":"'"${MEMORY_VALUE}"'"},
      {"type":"VCPU","value":"'"${VCPU_VALUE}"'"}
    ],
    "command":["node","'"${JOB_COMMAND}"'"],
    "environment":[
      {"name":"NODE_ENV","value":"'"${ENVIRONMENT}"'"},
      {"name":"USE_AWS_PARAMETER_STORE","value":"true"}
    ],
    "fargatePlatformConfiguration":{"platformVersion":"1.4.0"},
    "networkConfiguration":{"assignPublicIp":"ENABLED"}
  }' \
  --region "${AWS_REGION}"

echo "Scheduling job with EventBridge..."
aws events put-rule \
  --name "${JOB_NAME}-${ENVIRONMENT}" \
  --schedule-expression "${SCHEDULE_EXPRESSION}" \
  --region "${AWS_REGION}"

aws events put-targets \
  --rule "${JOB_NAME}-${ENVIRONMENT}" \
  --targets '[{
    "Id":"1",
    "Arn":"arn:aws:batch:'"${AWS_REGION}"':'"${AWS_ACCOUNT_ID}"':job-queue/'"${JOB_QUEUE_NAME}"'",
    "BatchParameters":{
      "JobDefinition":"'"${JOB_NAME}-${ENVIRONMENT}"'",
      "JobName":"'"${JOB_NAME}-${ENVIRONMENT}"'"
    },
    "RoleArn":"'"${EVENTS_ROLE_ARN}"'"
  }]' \
  --region "${AWS_REGION}"

echo "Deploy completed."
