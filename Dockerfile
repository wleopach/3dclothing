# Use Nginx as the base image
FROM nginx:alpine

# Copy the built frontend files to Nginx HTML directory
COPY ./dist /usr/share/nginx/html

# Copy custom Nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
