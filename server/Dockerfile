# Use Node.js 18 slim as base
FROM node:18-slim

# Install g++ for C++ execution engine
# We also add make/python3 just in case node-gyp needs them for dependencies
RUN apt-get update && apt-get install -y g++ make python3 && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
