ARG BUN_VERSION=1.2.8

FROM oven/bun:${BUN_VERSION} AS base
WORKDIR /usr/src/app

COPY . .
RUN bun install --frozen-lockfile
 
FROM base AS backend
WORKDIR /usr/src/app/apps/backend

 
USER bun

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000/tcp

ENTRYPOINT [ "bun", "start" ]