FROM node:20
WORKDIR /app

RUN corepack enable

COPY .gitignore package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 5000
CMD ["node", "dist/index.js"]
