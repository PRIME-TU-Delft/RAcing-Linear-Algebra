FROM node:20 AS builder
WORKDIR /app

ARG REACT_APP_BACKEND_URL=http://localhost:8001
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN corepack enable
# RUN corepack prepare pnpm@latest --activate

COPY .gitignore package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build



FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g serve

COPY --from=builder --chown=node:node /app/build ./build

EXPOSE 3000
CMD ["serve", "-s", "build"]
