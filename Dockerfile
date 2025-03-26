# Stage 1: Builder
# Use a Node.js image that includes Yarn. Choose a version matching your needs.
FROM node:22-slim AS builder

WORKDIR /usr/src/app

# Copy package.json and yarn.lock
# Copying package*.json ensures package.json is included.
COPY package*.json yarn.lock ./

# Install *all* dependencies (including devDependencies) using the lockfile
# Ensures consistent installs based on yarn.lock
RUN yarn install --frozen-lockfile

# Copy the rest of the application source code
# This includes your src/ folder, tsconfig.json, etc.
COPY . .

# Build the TypeScript project using the build script defined in package.json
RUN yarn build

# --- Stage 2: Production Runner ---
# Use a slimmer Node.js image for the final stage
FROM node:22-alpine

WORKDIR /usr/src/app

# Copy package.json and yarn.lock again for installing production dependencies
COPY package*.json yarn.lock ./

# Install *only* production dependencies using the lockfile
RUN yarn install --production --frozen-lockfile

# Copy the built application code (the 'dist' folder) from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy necessary production assets if any (e.g., public folders, templates) that were part of the source
# Make sure these assets are not excluded by .dockerignore if you use one
# Example:
# COPY --from=builder /usr/src/app/public ./public

# Expose the port your application listens on (adjust if different)
EXPOSE 3000

# Define the command to run your application
# Using 'node' directly is often preferred for production containers
CMD [ "node", "dist/index.js" ]
