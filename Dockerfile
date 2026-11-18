FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src ./src

FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/src ./src
ARG SERVICE=gateway
ENV SERVICE=${SERVICE}
USER node
EXPOSE 3001 3002 3003 3004
CMD ["sh","-c","node src/${SERVICE}/server.js"]
