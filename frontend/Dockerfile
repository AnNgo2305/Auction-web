# ============================================
# Build arguments
# ============================================
ARG NODE_VERSION=22
ARG NGINX_VERSION=alpine

# ============================================
# Stage 1: Dependencies layer
# ============================================
# Use the configurable Node.js version on Alpine Linux
FROM node:${NODE_VERSION}-alpine AS deps

# Set working directory inside the container
WORKDIR /app

# Copy only dependency files for better cache reuse
COPY package.json package-lock.json ./

# Install all dependencies, including development dependencies
# Required for Vite and other frontend build tools
RUN npm ci \
    && npm cache clean --force

# ============================================
# Stage 2: Builder
# ============================================
# Reuse the dependencies installed in the previous stage
FROM deps AS builder

# Set working directory inside the container
WORKDIR /app

# Receive API URL from Docker build arguments
ARG VITE_API_URL

# Copy frontend source code
COPY . .

# Build the Vite application with the supplied API URL
RUN VITE_API_URL="${VITE_API_URL}" npm run build

# ============================================
# Stage 3: Production runtime
# ============================================
# Use Nginx to serve static files
FROM nginx:${NGINX_VERSION} AS production

LABEL org.opencontainers.image.title="Auction Frontend" \
      org.opencontainers.image.description="React application served by Nginx"

# Create a dedicated system group for the Nginx runtime user.
# - webgroup: dedicated group for the Nginx runtime user.
# - GID 10001: explicitly assigns the group's numeric ID for predictable permissions.
RUN addgroup -S -g 10001 webgroup

# Create a dedicated non-root system user.
# - webuser: dedicated account used to run Nginx.
# - UID 10001: explicitly assigns the user's numeric ID.
#   -S: creates a system account/group rather than a regular login account.
#   -D: does not create a password.
#   -H: does not create a home directory.
#   -G webgroup: adds webuser to the webgroup group.
#   -s /sbin/nologin: prevents normal interactive login through this shell.
RUN adduser -S -D -H -u 10001 -G webgroup -s /sbin/nologin webuser

# Copy the built Vite assets into Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create temporary directories required by Nginx
RUN mkdir -p /tmp/nginx_client_temp /tmp/nginx_proxy_temp /tmp/nginx_fastcgi_temp /tmp/nginx_uwsgi_temp /tmp/nginx_scgi_temp

# Grant webuser permission to write to Nginx temporary directories
RUN chown -R webuser:webgroup /tmp/nginx_client_temp /tmp/nginx_proxy_temp /tmp/nginx_fastcgi_temp /tmp/nginx_uwsgi_temp /tmp/nginx_scgi_temp

# Run Nginx as a non-root user
# User: webuser (uid=10001)
# Group: webgroup (gid=10001)
USER webuser:webgroup

# Expose the port Nginx listens on inside the container
# The container serves HTTP traffic on port 8080.
EXPOSE 8080

HEALTHCHECK --interval=30s \
            --timeout=3s \
            --start-period=5s \
            --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1

# Start Nginx directly instead of running the default image entrypoint scripts.
# This is appropriate because Nginx is configured to run as a non-root user.
ENTRYPOINT ["nginx"]

# Keep Nginx running in the foreground.
# Docker can then track the Nginx process as the container's main process.
CMD ["-g", "daemon off;"]
