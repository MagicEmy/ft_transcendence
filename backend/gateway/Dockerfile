FROM node:20-alpine

WORKDIR /app

COPY *.json .

RUN npm update && npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "start:dev"]