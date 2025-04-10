FROM node:18.18-alpine 

WORKDIR /app

COPY front-end/package.json front-end/package-lock.json /app/


RUN npm install
COPY front-end/ /app/

RUN npm run build

EXPOSE 3000

CMD [ "npm","start" ]