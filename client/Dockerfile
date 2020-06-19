#phase 1 client imahe builg
FROM node:alpine as builder
WORKDIR '/app'
#copy package json to WORKDIR
COPY ./package.json ./
RUN npm install
COPY . .
#set up the build process builds production version of app
RUN npm run build
#above will create a build folder inside

#phase 2 set up nginx
FROM nginx
EXPOSE 3000
#overwrite existing default.conf file below
COPY ./nginx/default.conf /etc/ngix/conf.d/default.conf
#copy production build assets from builder phase to nginx server
COPY --from=builder /app/build /usr/share/nginx/html


