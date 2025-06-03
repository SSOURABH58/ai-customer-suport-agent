FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

ENV MONGODB_URI=mongodb://root:example@localhost:27017/
# Build the application
RUN npm run build

# Expose the Next.js port (default 3000)
EXPOSE 3000

# Run the application
CMD ["npm", "start"]