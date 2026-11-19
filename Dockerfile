FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src ./src

FROM node:24-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
              /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
COPY --from=builder /app/src ./src
ARG SERVICE=gateway
ENV SERVICE=${SERVICE}
USER node
EXPOSE 3001 3002 3003 3004
CMD ["sh","-c","node src/${SERVICE}/server.js"]