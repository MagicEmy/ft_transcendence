FROM node:20.10-alpine

WORKDIR /app

COPY package*.json .

RUN npm ci

CMD ["npm", "run", "start:dev"]