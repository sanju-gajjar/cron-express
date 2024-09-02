# Use the official Node.js image.
FROM node:18

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests.
COPY package*.json ./

# Install production dependencies.
RUN npm install

# Copy the source code.
COPY . .

# Expose port 3000.
EXPOSE 3000

# Run the application.
CMD ["node", "index.js"]
