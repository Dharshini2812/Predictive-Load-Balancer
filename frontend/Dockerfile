# Build Stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Copy a basic nginx config if needed, but default is usually fine for simple SPA
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
