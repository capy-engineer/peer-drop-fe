# Base stage for dependencies
FROM node:20-alpine AS BASE

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json pnpm-lock.yaml ./

# Install the dependencies
RUN apk add --no-cache git \
    && corepack enable \
    && pnpm install --frozen-lockfile \
    && pnpm store prune \
    && rm -rf /tmp/*

# Build stage
FROM node:20-alpine AS BUILD

# Set the working directory
WORKDIR /app

# Copy dependencies từ stage BASE
COPY --from=BASE /app/node_modules ./node_modules
COPY . .

RUN apk add --no-cache git curl \
    && pnpm build \
    && cd .next/standalone \
    && npm prune --production

# Production stage
FROM node:20-alpine AS PRODUCTION

# Set the working directory
WORKDIR /app

# Copy necessary files form the build stage
COPY --from=BUILD /app/public ./public
COPY --from=BUILD /app/next.config.js ./

# Copy the standalone & static folder
COPY --from=BUILD /app/.next/standalone ./
COPY --from=BUILD /app/.next/static ./.next/static

# Expose the port 3000
EXPOSE 3000

# Run the application
CMD ["node", "server.js"]