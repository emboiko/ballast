#!/bin/bash
set -e

JOB_NAME=$1
ENVIRONMENT=$2

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

JOB_DEFINITION="${JOB_NAME}-${ENVIRONMENT}"
JOB_QUEUE_ARN="arn:aws:batch:${AWS_REGION}:${AWS_ACCOUNT_ID}:job-queue/${JOB_QUEUE_NAME}"

submit_job_result=$(aws batch submit-job --job-name "${JOB_NAME}-${ENVIRONMENT}" --job-queue "${JOB_QUEUE_ARN}" --job-definition "${JOB_DEFINITION}" --region "${AWS_REGION}")

echo "${submit_job_result}"
job_id=$(echo "${submit_job_result}" | jq -r '.jobId')

if [ -z "$job_id" ] || [ "$job_id" == "null" ] ; then
  echo "ERROR: Could not submit job '${JOB_NAME}-${ENVIRONMENT}'."
  exit 1
fi

echo "Job submitted with id ${job_id}. Monitoring status..."

job_status="SUBMITTED"
echo "job status: ${job_status}"

while [[ "${job_status}" =~ ^(SUBMITTED|RUNNABLE|STARTING|RUNNING)$ ]]; do
  sleep 5
  job_detail=$(aws batch describe-jobs --jobs "${job_id}" --region "${AWS_REGION}")
  job_status=$(echo "${job_detail}" | jq -r '.jobs[0].status')
  echo "job status: ${job_status}"
done

echo "Job finished."
echo "Details: ${job_detail}"
