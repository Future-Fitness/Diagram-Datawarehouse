# worker/Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Bundle app source
COPY . .

# Set NODE_ENV to production
ENV NODE_ENV production

# Start the worker service
CMD ["node", "src/index.js"]