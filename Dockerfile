# Single-container image: Node 20 (Debian slim) + MongoDB Community Edition
FROM node:20-slim

# ── MongoDB installation ──────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    gnupg \
    curl \
    ca-certificates \
  && curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc \
       | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg \
  && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" \
       > /etc/apt/sources.list.d/mongodb-org-7.0.list \
  && apt-get update && apt-get install -y --no-install-recommends \
    mongodb-org \
  && rm -rf /var/lib/apt/lists/*

# Create MongoDB data & log dirs
RUN mkdir -p /data/db /var/log/mongodb \
  && chown -R mongodb:mongodb /data/db /var/log/mongodb

# ── App setup ─────────────────────────────────────────────────────────────────
WORKDIR /app

# Copy manifests first (better layer caching)
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy application source
COPY . .

# Bake in the localhost MongoDB URI (no external env var required for MongoDB)
ENV MONGODB_URI=mongodb://127.0.0.1:27017/

# Build the Next.js application
RUN npm run build

# ── Runtime ───────────────────────────────────────────────────────────────────
EXPOSE 3000

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]