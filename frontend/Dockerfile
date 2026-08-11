# Stage 1: Build stage using Node.js
FROM node:20-alpine AS build

WORKDIR /app

# Accept Vite build-time environment variable
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy package files first
COPY package.json package-lock.json ./

# Clean install of dependencies
RUN npm ci

# Copy source code and build the production distribution (dist/)
COPY . .
RUN npm run build

# Stage 2: Serve stage using Nginx
FROM nginx:alpine

# Copy built static assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the Nginx server block configuration template
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Expose default Cloud Run container port
EXPOSE 8080
