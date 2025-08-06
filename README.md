GRSE Leadership Insights Dashboard
This repository contains the source code for the AI-enabled Leadership Insights Dashboard, a multi-container application built with React, Flask, and PostgreSQL.

The Docker images for the frontend and backend services are hosted on Docker Hub, making it easy to run the entire stack with a single command.

Prerequisites
To run this application, you must have the following software installed:

Git: For cloning the repository.

Docker Desktop: Includes Docker Engine and Docker Compose. Ensure it is running before proceeding.

Setup Instructions
Clone the Repository

First, clone this repository to your local machine:

git clone [YOUR_GITHUB_REPO_URL]
cd grse-dashboard-app

Update the docker-compose.yml file

Open the docker-compose.yml file in the root directory. You must replace the placeholder [YOUR_DOCKERHUB_USERNAME] with the actual Docker Hub username that hosts the pre-built images.

services:
  backend:
    image: [YOUR_DOCKERHUB_USERNAME]/grse-dashboard-app-backend:latest
    ...
  frontend:
    image: [YOUR_DOCKERHUB_USERNAME]/grse-dashboard-app-frontend:latest
    ...

Run the Application

From the grse-dashboard-app directory, run the following command. Docker Compose will automatically pull the images from Docker Hub and start all three services (database, backend, and frontend).

docker-compose up

You do not need the --build flag because the images are already built.

Populating the Database
The database container will start empty. You must manually run the SQL script to create the tables and insert the initial user and dashboard data.

Get a shell inside the database container:

docker exec -it grse-dashboard-app-database-1 sh

Connect to the PostgreSQL database:

psql -U grse_user -d grse_db

Run the SQL script: Copy the entire contents of the sql-script-admin file and paste it into the psql shell. This will create all the necessary tables and users.

Exit the shells:

\q  # To exit psql
exit # To exit the container shell

Accessing the Application
Once the containers are running and the database is populated, you can access the application:

Dashboard Frontend: Open your web browser and go to http://localhost:3000.

Login Credentials
Use one of the following accounts to log in and test the role-based access:

Admin User:

Username: Girish

Password: admin

Regular User:

Username: user

Password: user

Viewer User:

Username: viewer

Password: viewer

for generating password
http://localhost:5000/api/generate-password-hash?password=user


Contact
For any questions or issues, please contact [YOUR NAME/EMAIL].
