# Use an official Node.js image
FROM node:18

# Set working directory
WORKDIR /app/frontend

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Build the React app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]
