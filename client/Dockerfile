# --- 1. Base image for building ---
    FROM node:20-alpine AS builder

    # Set working directory
    WORKDIR /app
    
    # Copy package.json and install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy the rest of your application code
    COPY . .
    
    # Optional: Add webcrypto for packages needing getRandomValues (e.g., uuid)
    ENV NODE_OPTIONS=--experimental-global-webcrypto
    
    # Build the React app using Vite
    RUN npm run build
    
    # --- 2. Production image to serve files ---
    FROM nginx:alpine
    
    # Copy built assets from builder stage to nginx public folder
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # Copy custom nginx config (optional but recommended)
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Expose port 80
    EXPOSE 80
    
    # Start nginx server
    CMD ["nginx", "-g", "daemon off;"]
    