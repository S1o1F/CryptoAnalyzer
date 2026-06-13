FROM nginx:alpine

# Copy frontend files to nginx html directory
COPY prototype/ /usr/share/nginx/html/

# Copy custom nginx configuration
COPY prototype/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Nginx starts automatically
CMD ["nginx", "-g", "daemon off;"]

