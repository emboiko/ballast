# Placeholder Dockerfile for AWS Batch job server
# TODO: Configure proper build and runtime setup

FROM node:20

WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/jobs ./apps/jobs
COPY packages/shared ./packages/shared

# Enable pnpm and install dependencies
RUN corepack enable && pnpm install --frozen-lockfile

WORKDIR /app/apps/jobs

# Default command - will be overridden by AWS Batch job definition
CMD ["node", "--version"]
