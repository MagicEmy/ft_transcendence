FROM node:20.10-alpine

WORKDIR /app

COPY *.json .

RUN npm ci

COPY . .

CMD ["npm", "run", "start:dev"]