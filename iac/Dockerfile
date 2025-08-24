# Use the official AWS Lambda Node.js runtime as the base image
FROM public.ecr.aws/lambda/nodejs:18

# Copy package.json and package-lock.json (if available)
COPY apps/backend/package*.json ${LAMBDA_TASK_ROOT}/

# Install dependencies
RUN npm install --only=production

# Copy the Lambda function code
COPY apps/backend/consolidated-ai-handler.js ${LAMBDA_TASK_ROOT}/

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD ["consolidated-ai-handler.handler"]