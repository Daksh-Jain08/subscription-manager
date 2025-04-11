# Base image
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose port and run app
EXPOSE 5001
CMD ["npm", "start"]
