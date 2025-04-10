# front-end/Dockerfile
FROM node:18.18-alpine

# set working directory
WORKDIR /app

# copy package manifests, install deps
COPY package.json package-lock.json /app/
RUN npm install

# copy the rest of the frontend code
COPY . /app/

# build the Next.js app
RUN npm run build

# expose Next.js port
EXPOSE 3000

# start the production server
CMD ["npm", "start"]
