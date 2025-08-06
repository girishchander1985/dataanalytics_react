# STEP 1: We start with a base image that has Node.js and npm, which we need to build our React app.
# We call this stage 'build'
FROM node:18-alpine AS build

# STEP 2: Set the working directory inside the container. This is like 'cd /app' on your computer.
WORKDIR /app

# STEP 3: Copy the package.json file from your computer to the container.
COPY package.json .
# Then, run 'npm install' to download and install all the libraries listed in package.json.
RUN npm install

# STEP 4: Copy all the other code from your frontend folder to the container.
COPY . .

# STEP 5: Run the build command to compile the React app into static HTML, CSS, and JavaScript files.
# This is the production-ready version of your app.
RUN npm run build

# --- This is a multi-stage build. We're starting a new, smaller container now. ---

# STEP 6: Use a different, much smaller base image that only has Nginx, a web server.
# This makes our final container very small and secure.
FROM nginx:alpine

# STEP 7: Copy the finished, built React app from the first 'build' stage into Nginx's web server folder.
COPY --from=build /app/build /usr/share/nginx/html

# STEP 8: Tell the container to open port 80 so it can receive web traffic.
EXPOSE 80

# STEP 9: This is the command that runs when the container starts. It starts the Nginx web server.
CMD ["nginx", "-g", "daemon off;"]