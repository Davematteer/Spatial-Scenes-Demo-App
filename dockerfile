# --- Stage 1: Base Build Layer (Monorepo Context) ---
# slim instead of alpine avoids network/DNS hangs during install
FROM oven/bun:1.2-slim AS builder
WORKDIR /app

# 1. ONLY copy package.json files first
COPY package.json ./
COPY shared/package.json ./shared/
COPY client/package.json ./client/
COPY server/package.json ./server/

# 2. Install dependencies but forcefully skip the Turbo postinstall script
RUN bun install --ignore-scripts

# 3. Copy the rest of your monorepo source code (including turbo.json)
COPY . .

# 4. Now that turbo.json is here, run the builds manually
RUN bun run build --filter shared
RUN bun run build --filter client

# --- Stage 2: Production Frontend Runner (Nginx) ---
FROM nginx:alpine AS frontend-runtime
COPY --from=builder /app/client/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# --- Stage 3: Production Backend Runner (Bun Runtime) ---
FROM oven/bun:1.2-slim AS backend-runtime
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/server ./server

WORKDIR /app/server
EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]