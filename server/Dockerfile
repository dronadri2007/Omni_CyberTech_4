# Build context: repository root.
# ---- build ----
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci
COPY server/tsconfig.json ./server/
COPY server/src ./server/src
RUN cd server && npm run build

# ---- runtime ----
FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/server/dist ./server/dist
COPY database ./database
EXPOSE 5000
WORKDIR /app/server
USER node
CMD ["node", "dist/index.js"]
