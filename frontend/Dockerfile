FROM node:20-alpine

WORKDIR /app

COPY *.json .

RUN npm update && npm install

COPY . .

CMD ["npm", "start"]
