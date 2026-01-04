# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (ignore scripts to avoid husky error)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code first
COPY . .

# Set dummy DATABASE_URL for Prisma generate
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
# Generate Prisma Client
RUN pnpx prisma generate

# Build application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies (ignore scripts to avoid husky error)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Install prisma CLI for migrations
RUN pnpm add prisma@7.0.1

# Copy prisma schema and config
COPY prisma ./prisma
COPY prisma.config.ts ./

# Set dummy DATABASE_URL for Prisma generate
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma Client
RUN pnpx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Unset dummy DATABASE_URL
ENV DATABASE_URL=""

# Expose port
EXPOSE 5058

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5058/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/src/main"]
