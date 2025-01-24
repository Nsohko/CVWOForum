# Step 1: Build the React frontend using Yarn
FROM node:18 AS build
WORKDIR /app
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN yarn install 
RUN yarn build

# Step 2: Build the Golang backend
FROM golang:1.23-bookworm
WORKDIR /app
COPY backend/ ./backend/
WORKDIR /app/backend
RUN go build -o server .

# Make the binary and scripts executable
RUN chmod +x server
RUN chmod +x ./database/backup.sh

# Step 3: Combine frontend build with backend
WORKDIR /app
COPY --from=build /app/frontend/build ./frontend/build

# Create cron job to take backup
RUN apt-get update && apt-get install -y cron
RUN crontab -l | { cat; echo "0 0 * * * bash /app/database/backup.sh"; }

# Expose port and start the app
EXPOSE 8080
WORKDIR /app/backend
CMD ["./server"]
