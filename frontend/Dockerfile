# ===============================
# Stage 1: Builder
# ===============================
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Disable telemetry + build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ===============================
# Stage 2: Runtime
# ===============================
FROM node:18-bullseye-slim

WORKDIR /app

# Create non-root user
RUN useradd -m -u 1001 nextjs

# Copy required files only
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]





# # Multi-stage frontend Dockerfile for Next.js application
# # Stage 1: Builder - build Next.js application
# FROM node:18-alpine AS builder

# WORKDIR /app

# # Install dependencies
# COPY package.json package-lock.json* ./
# RUN npm ci

# # Copy source code and build
# COPY . .
# RUN npm run build

# # Stage 2: Runtime - minimal production image with Next.js
# FROM node:18-alpine

# WORKDIR /app

# # Create non-root user for security
# RUN addgroup -g 1001 -S nodejs && \
#     adduser -S nextjs -u 1001

# # Copy dependencies
# COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# # Copy built Next.js application and public files
# COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# # Set environment variables for production
# ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1

# # Switch to non-root user
# USER nextjs

# # Expose port
# EXPOSE 3000

# # Health check endpoint
# HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
#     CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# # Run Next.js in production mode
# CMD ["npm", "start"]
