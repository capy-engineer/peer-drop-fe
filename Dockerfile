# Base image with dependencies
FROM node:20-alpine AS base

WORKDIR /app

# Copy package.json and yarn.lock for dependencies installation
COPY package.json yarn.lock ./

# Install dependencies
RUN apk add --no-cache git \
    && yarn install --frozen-lockfile \
    && yarn cache clean

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy node_modules from base image
COPY --from=base /app/node_modules ./node_modules

# Copy the rest of the source code
COPY . .

# Install curl and run the build
RUN apk add --no-cache git curl \
    && yarn build \
    && cd .next/standalone \
    && node-prune

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy necessary files from build image
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js ./
COPY --from=build /app/.next/standalone ./.next/standalone
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/.next/server ./.next/server

# Expose port 3000 for the app
EXPOSE 3000

# Run the production server
CMD ["node", ".next/standalone/server.js"]
