# Use Golang base image
FROM golang:1.23-bookworm AS base

# Set the working directory inside the container
WORKDIR /app

# Copy Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the application
RUN go build -o server .

# Make the binary and scripts executable
RUN chmod +x server
RUN chmod +x ./database/backup.sh

# Install Cron
RUN apt-get update && apt-get install -y cron

# Add the cron job
RUN crontab -l | { cat; echo "0 0 * * * cd /app/database && bash /app/database/backup.sh"; } | crontab -

# Expose the port your app listens on
EXPOSE 8080

# Command to run the application
CMD ["sh", "-c", "cron && ./server"]