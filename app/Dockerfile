# Build context is the repository root: the app imports generated
# contracts from ../packages through the pnpm workspace.
FROM node:22-alpine AS build
WORKDIR /repo

RUN npm install -g pnpm

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY app/package.json app/
COPY packages/package.json packages/
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY app app
COPY packages packages
RUN pnpm --filter app run build

FROM nginx:1.27-alpine AS runtime
COPY app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
