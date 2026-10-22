FROM node:22.23.4-alpine@sha256:fe4f6d74e20370acb04ad889077d14d0f64a9c8ea6a42bc60cddf1e844699914 AS node-runtime

FROM oven/bun:1.4.4-alpine@sha256:4cf82f5686b196504fe119db3fcd9185b191f82ece82c40680e597228ec6070a AS production

WORKDIR /app

# Use patched Node for pnpm and dependency lifecycle scripts.
COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node
COPY --from=node-runtime /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
RUN apk add --no-cache curl
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
RUN apk add --no-cache --virtual .build-deps python3 make g++ && \
    pnpm install --frozen-lockfile --prod && \
    apk del .build-deps

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
