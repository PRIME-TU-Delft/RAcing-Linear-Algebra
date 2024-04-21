FROM node:20 AS builder
WORKDIR /app

RUN corepack enable
# RUN corepack prepare pnpm@latest --activate

# COPY .gitignore .
# COPY package.json .
# COPY pnpm-lock.yaml .
COPY .gitignore package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build



FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder --chown=node:node /app/dist/ .

EXPOSE 5000
CMD ["node", "index.js"]
