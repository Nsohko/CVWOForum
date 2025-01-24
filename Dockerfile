# Step 1: Build the React frontend using Yarn
FROM node:18 AS build
WORKDIR /app
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN yarn install && yarn build && ls -l ./build

# Step 2: Build the Golang backend
FROM golang:1.23-bookworm
WORKDIR /app
COPY backend/ ./backend/
WORKDIR /app/backend
RUN go build -o server .

# Step 3: Combine frontend build with backend
WORKDIR /app
COPY --from=build /app/frontend/build ./frontend/build

# Expose port and start the app
WORKDIR /app/backend
EXPOSE 8080
CMD ["./server"]
