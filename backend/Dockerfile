# ---------- Stage 1 : Install Dependencies ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source
COPY . .

# ---------- Stage 2 : Production Image ----------
FROM node:20-alpine

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY --from=builder /app .

# Expose application port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]