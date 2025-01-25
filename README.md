# CVWO FORUM

Welcome to my CVWO Forum application!

The deployed website can be accessed [here](https://cvwoforum.onrender.com)

To deploy the app locally, there are 3 methods:

## Deploy without Docker  (for development)

To deploy with docker, you can do the following. Start at the root directory (```CVWOForum/```)

1. Deploy frontend

Enter the following commands:

```
cd frontend
yarn install
yarn run
```

2. Deploy backend

Navigate back to the root directory (```CVWOForum/```), and enter the following commands

```
cd backend
go mod download
go run main.go
```

The website can now be accessed at http://localhost:3000

## Deploy with docker in separate containers

NOTE: Ensure docker is installed
Navigate to the root directory (```CVWOForum/```)

Enter the following:
```docker-compose up --build```

Once again, the website should be available at http://localhost:3000

## Deploy with docker in same container
NOTE: Ensure docker is installed
Navigate to the root directory (```CVWOForum/```)

Enter the following:
```
docker build -t cvwoforum .
docker run -p 8080:8080 --name cvwoforum-container cvwoforum
```

The website will be available at http://localhost:8080

