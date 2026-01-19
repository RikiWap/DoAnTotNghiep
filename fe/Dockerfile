FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
ARG VITE_API_BASE=http://be.aeoc.io.vn
ENV VITE_API_BASE=${VITE_API_BASE}
ENV CI=false
RUN npm install --include=dev --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]



