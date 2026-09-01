# Dev-mode image: installs deps into the image, source is bind-mounted at
# runtime by docker-compose.yml for hot reload (next dev). A production
# build (next build + standalone output) is deferred until the SSG pages
# that query the DB at build time are revisited.
FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma generate

EXPOSE 3000

CMD ["pnpm", "dev"]
