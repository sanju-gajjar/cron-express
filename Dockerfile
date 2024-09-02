# Use the official Node.js image from the Docker Hub
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which the app will run
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
