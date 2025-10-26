# Use latest Node LTS
FROM node:20-bullseye-slim

# Set working directory
WORKDIR /app/frontend

# Update OS packages
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm ci --legacy-peer-deps

# Copy the rest of the frontend files
COPY . .

# Build the React app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]
