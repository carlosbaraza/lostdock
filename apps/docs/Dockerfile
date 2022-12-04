FROM node:16.17.1-alpine AS installer
RUN apk add --no-cache libc6-compat gcompat
RUN apk update
RUN corepack enable && corepack prepare pnpm@latest --activate
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@lostdock/docs --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:16.17.1-alpine AS builder
RUN apk add --no-cache libc6-compat gcompat
RUN apk update
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=installer /app/out/json/ .
COPY --from=installer /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm i --frozen-lockfile

# Build the project
COPY --from=installer /app/out/full/ .
COPY turbo.json turbo.json
# Build app and all dependencies with ...
RUN pnpm build --filter=...@lostdock/docs
RUN pnpm prune --production

FROM node:16.17.1-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app .

CMD ["pnpm", "run", "start", "--filter=@lostdock/docs"]