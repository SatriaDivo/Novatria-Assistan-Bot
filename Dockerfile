# ==========================================
# Stage 1: Build & Compile Native Dependencies
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# better-sqlite3 membutuhkan compiler C++ (python3, make, g++) saat instalasi di Alpine
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

# ==========================================
# Stage 2: Production Runner (Super Ringan)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install tzdata untuk memastikan waktu log/jadwal sesuai zona waktu lokal (Asia/Jakarta)
RUN apk add --no-cache tzdata procps

# Salin dependensi yang sudah dicompile dari builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY index.js ./
COPY src ./src
COPY assets ./assets

# Buat folder data untuk SQLite dan sesuaikan permission
RUN mkdir -p /app/data && chown -R node:node /app

USER node

VOLUME ["/app/data"]

CMD ["npm", "start"]
