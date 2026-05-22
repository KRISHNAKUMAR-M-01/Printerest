FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY src ./src

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Expose port
EXPOSE 5001

# Set environment variables
ENV PORT=5001

# Start the server
CMD [ "node", "src/index.js" ]
