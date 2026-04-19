# Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Final Stage
FROM node:18-alpine
WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from frontend-build stage into backend/public
COPY --from=frontend-build /app/frontend/build ./backend/public

# Expose port
EXPOSE 5005

# Start the application
WORKDIR /app/backend
ENV NODE_ENV=production
CMD ["npm", "start"]
