FROM node:24-alpine AS build

WORKDIR /app

RUN npm install -g pnpm@12.8.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build -- --configuration production --output-path=/app/dist

FROM nginx:alpine

COPY --from=build /app/dist/browser/ /usr/share/nginx/html/

RUN printf '%s\n' 'server {' \
	'  listen 80;' \
	'  server_name _;' \
	'  root /usr/share/nginx/html;' \
	'  index index.html;' \
	'  location / {' \
	'    try_files $uri $uri/ /index.html;' \
	'  }' \
	'}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
