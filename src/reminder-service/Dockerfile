FROM node:18
 
# Set working directory
WORKDIR /usr/src/app

RUN apt-get update && apt-get --allow-unauthenticated install -y netcat-openbsd

# Copy package.json and package-lock.json
COPY package*.json ./

#COPY wait-for.sh .

# Install dependencies
RUN npm install

COPY prisma ./prisma

# Copy rest of the app
COPY . .
RUN chmod +x ./entrypoint.sh

# Expose port
EXPOSE ${PORT}
EXPOSE 50051

RUN npx prisma generate
CMD ["sh", "./entrypoint.sh"]
