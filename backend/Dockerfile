# ============================================
# Build arguments
# ============================================
ARG NODE_VERSION=22

# ============================================
# Stage 1: Dependencies layer
# ============================================
# Use the configurable Node.js version on Alpine Linux
FROM node:${NODE_VERSION}-alpine AS deps

# Set working directory inside the container
WORKDIR /app

# Copy dependency manifests first
# Docker can reuse this layer if package.json and package-lock.json do not change
COPY package.json package-lock.json ./

# Install all dependencies, including development dependencies
# Required for building the NestJS application
RUN npm ci

# ============================================
# Stage 2: Builder
# ============================================
# Reuse the dependencies installed in the previous stage
FROM deps AS builder

# Set working directory
WORKDIR /app

# Copy the remaining backend source code and configuration
# Files excluded by .dockerignore will not be copied
COPY . .

# Generate Prisma Client based on the project's Prisma schema
# prisma generate only reads schema.prisma and never connects to the database.
# prisma.config.ts requires DATABASE_URL to exist, so a placeholder is used.
# The real DATABASE_URL is provided at runtime via docker compose "environment".
RUN DATABASE_URL="mysql://placeholder:placeholder@localhost:3306/placeholder" npx prisma generate

# Compile the NestJS application
# Usually generates production JavaScript files in /app/dist
RUN npm run build

# ============================================
# Stage 3: Production
# ============================================
# Use the configurable Node.js version on Alpine Linux
FROM node:${NODE_VERSION}-alpine AS production

# Image metadata
LABEL org.opencontainers.image.title="Auction Backend" \
      org.opencontainers.image.description="NestJS backend API for Auction-web" \
      org.opencontainers.image.version="1.0.0"

# Set working directory inside the container
WORKDIR /app

# Set the application environment to production
ENV NODE_ENV=production

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install production dependencies only
# Excludes development tools such as NestJS CLI and Prisma CLI
RUN npm ci --omit=dev \
    && npm cache clean --force

# Copy the compiled NestJS application from the builder stage
COPY --from=builder /app/dist ./

# Copy the generated Prisma Client
# Assumes the Prisma generator outputs the client to /app/generated
COPY --from=builder /app/generated ./generated

# Create a dedicated system group for the application runtime user
# GID 10001 provides a predictable numeric group ID
RUN addgroup -S -g 10001 webgroup

# Create a dedicated non-root system user
# UID 10001 provides a predictable numeric user ID
# -S: create a system user
# -D: do not assign a password
# -H: do not create a home directory
# -G webgroup: assign the user to webgroup
# -s /sbin/nologin: prevent interactive login
RUN adduser -S -D -H -u 10001 -G webgroup -s /sbin/nologin webuser

# Assign ownership of the application directory to the non-root user
RUN chown -R webuser:webgroup /app

# Run the application as a non-root user
USER webuser:webgroup

# Check whether the NestJS application responds to HTTP requests
# Uses the existing GET / endpoint
HEALTHCHECK --interval=30s \
            --timeout=3s \
            --start-period=10s \
            --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/', (res) => { process.exit(res.statusCode >= 200 && res.statusCode < 400 ? 0 : 1) }).on('error', () => process.exit(1))"

# Run the NestJS application as the container's main process
# ENTRYPOINT defines the executable to run
ENTRYPOINT ["node"]

# Specify the compiled NestJS application as the argument
# Docker runs: node dist/src/main.js
CMD ["src/main.js"]