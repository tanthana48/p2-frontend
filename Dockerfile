# Build the VueJS application
FROM node:16 as build-stage

# Set up working directory
WORKDIR /app
# Copy package.json and package-lock
COPY ./frontend/package*.json ./
COPY ./frontend ./

#Install dependency and build
RUN yarn install
RUN yarn build

# Serve the application using NGINX
FROM nginx:1.21-alpine

COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
