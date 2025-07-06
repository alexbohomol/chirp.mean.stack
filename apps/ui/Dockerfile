# Use a Node.js 0.12 base image.
# Note: Node.js 0.12 is an older, deprecated version.
# For new projects, it is highly recommended to use a more recent LTS version.
# FROM node:0.12
FROM node:0-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if present) to the working directory
# This allows Docker to cache the npm install step if dependencies haven't changed
COPY package.json ./

# Install application dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port your application listens on (e.g., 3000)
EXPOSE 3000

# Command to run the application
# CMD ["node", "app.js"]
CMD ["npm", "start"]
# CMD ["node", "bin/www"]
