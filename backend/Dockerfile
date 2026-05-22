FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files from the backend folder to the container's root
COPY backend/package.json backend/package-lock.json* ./
RUN npm install

# Copy source code from the backend folder
COPY backend/src ./src

# Copy prisma schema and generate client
COPY backend/prisma ./prisma
RUN npx prisma generate

# Expose port
EXPOSE 5001

# Set environment variables
ENV PORT=5001

# Start the server
CMD [ "node", "src/index.js" ]
