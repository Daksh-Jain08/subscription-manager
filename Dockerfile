# Use an official Node.js runtime as a parent image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

ENV ENV_MODE=docker

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Expose port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]

