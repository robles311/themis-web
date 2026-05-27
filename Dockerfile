# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install

COPY src ./src
COPY public ./public
COPY tsconfig.json next.config.ts postcss.config.mjs ./

RUN npx next build

# Stage 2: Production runner
FROM node:22-alpine AS runner

RUN apk add --no-cache python3 py3-pip curl && \
    pip3 install --break-system-packages fastembed 2>&1 | tail -1

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

COPY --chown=nextjs:nodejs scripts ./scripts
COPY --chown=nextjs:nodejs seed-data.json ./

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
