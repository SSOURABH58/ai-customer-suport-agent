#!/bin/sh
set -e

# Start MongoDB as a background process
echo "Starting MongoDB..."
mongod --dbpath /data/db --logpath /var/log/mongodb/mongod.log --fork --bind_ip 127.0.0.1

# Wait until MongoDB is accepting connections
echo "Waiting for MongoDB to be ready..."
until mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  sleep 1
done
echo "MongoDB is ready."

# Start Next.js
echo "Starting Next.js..."
exec npm start
