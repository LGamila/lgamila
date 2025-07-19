FROM oven/bun:1-alpine AS production

WORKDIR /app

# Setup node and package managers
RUN apk add --no-cache nodejs npm
RUN npm install -g corepack
RUN corepack enable

# Copy package manager files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc .npmrc

# Copy all package.json files 
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/logging/package.json ./packages/logging/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install pnpm and production dependencies only
RUN pnpm install --frozen-lockfile --prod

COPY . .

USER bun

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000 

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start server
WORKDIR /app/apps/backend
CMD ["bun", "run", "src/index.ts"] 