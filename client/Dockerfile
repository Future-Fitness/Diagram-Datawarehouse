# Step 1: Build React App
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Step 2: Serve with NGINX
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Optional: if you want to override NGINX config for SPA routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf
