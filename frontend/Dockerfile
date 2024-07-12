FROM node:20-alpine

WORKDIR /app

COPY *.json .

ENV NODE_OPTIONS=--no-warnings

RUN npm update && npm install

COPY . .

CMD ["npm", "start"]
