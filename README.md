# CVWO FORUM

Welcome to my CVWO Forum application!

The live website can be accessed [here](https://cvwoforum.onrender.com)

## Local Deployment

To deploy the app locally, there are 3 methods:

### Deploy without Docker  (for development)

To deploy with docker, you can do the following. Please ensure that Go, Node.js and yarn have been installed  

Start at the root directory (```CVWOForum/```)

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

### Deploy with docker in separate containers

NOTE: Ensure docker is installed
Navigate to the root directory (```CVWOForum/```)

Enter the following:  
```docker-compose up --build```

Once again, the website should be available at http://localhost:3000

### Deploy with docker in same container

NOTE: Ensure docker is installed
Navigate to the root directory (```CVWOForum/```)

Enter the following:
```
docker build -t cvwoforum .
docker run -p 8080:8080 --name cvwoforum-container cvwoforum
```

The website will be available at http://localhost:8080

## User Manual

Here I have included a brief user manual on how to run the web forum.

1.	Creating account / logging in
    
    Upon launching the website, you will be greeted with the home page, consisting of a list of possible discussion topics. Clicking each topic will show you the relevant posts.

    Please create an account by clicking on the button at the top right of the screen.

    Alternatively, you may log in using the following credentials to access the admin account. This account has already been pre-created.
    ```
    Username: admin123
    Password: admin123
    ```
    <br />

2.	Creating Posts 
    
    After successfully logging in, you may create posts under any existing topic by clicking the ‘Add Post’ button

    You can click on any post to expand its details  
    <br/>

3.	Adding comments
        
    Similarly, after logging in and clicking on a post, you may add a comment using the ‘Add Comment’ button below

    Comments also support nested replies (i.e. you can reply to any comment), and this currently has no depth limit (i.e. theoretically, we can support ‘infinite’ depth of nested comments). To view subcomments, simply click on any comment  
    <br/>
    
4.	Editing Posts / Comments

    Standard users are able to edit and delete their own posts / comments

    Admin users (from step 1) can edit and delete any posts / comment

    Note that admin users can also add / delete topics  
    <br/>
    
5.	Mobile View
    
    Generally, all functionalities work across browsers and operating systems (including mobile phones)

    However, there is some issues rendering comments on smaller screens
