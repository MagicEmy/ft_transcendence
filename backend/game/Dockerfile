FROM node:20.17.0-alpine3.19

WORKDIR /app

COPY *.json .

RUN npm update && npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "start:prod"]
