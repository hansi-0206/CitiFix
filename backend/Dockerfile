# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json ./

# Install dependencies using clean install (npm ci) omitting devDependencies
RUN npm ci --omit=dev

# Copy the rest of the application files
COPY . .

# Expose the default port (5000)
EXPOSE 5000

# Start the application using npm start
CMD ["npm", "start"]
