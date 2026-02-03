# =========================
# 1️ Build stage
# =========================
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency files first (better caching)
COPY package.json package-lock.json ./

RUN npm ci

# Copy source code
COPY . .

# Angular 18 production build
RUN npm run build -- --configuration production


# =========================
# 2️ Runtime stage
# =========================
FROM nginx:alpine


# Copy custom nginx config
COPY --from=build /app/www /usr/share/nginx/html

COPY --from=build /app/dist/central-market-web-mobile/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]