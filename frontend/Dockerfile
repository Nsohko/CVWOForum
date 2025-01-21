# Use a Node.js base image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./yarn.lock ./
RUN yarn install

# Copy the app's source code
COPY . .

# Set the environment variable for the build step
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN yarn build

# Use Nginx base image for serving the built files
FROM nginx:stable-alpine

# Copy the built app to the Nginx serving directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to serve the app
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]