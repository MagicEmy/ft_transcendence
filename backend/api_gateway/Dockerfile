FROM node:18-alpine

WORKDIR /app

COPY package*.json .

RUN npm ci

CMD ["npm", "run", "start:dev"]