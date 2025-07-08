
FROM node:22.14-alpine AS base

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production --ignore-scripts --prefer-offline

COPY . .

EXPOSE 3002

CMD [ "node", "app.js" ]

