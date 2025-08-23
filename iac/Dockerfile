# Use the official AWS Node.js Lambda base image.
FROM public.ecr.aws/lambda/nodejs:18

# Set the working directory to the Lambda task root.
WORKDIR /var/task/

# Copy the function code and package files from their new location.
COPY consolidated-ai-handler.js ./
COPY package.json ./

# Install the function's dependencies.
RUN npm install

# Define the command that Lambda will execute to run your function.
# The format is "[file_name].[handler_name]".
CMD ["consolidated-ai-handler.handler"]