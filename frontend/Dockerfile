FROM node:20-alpine

WORKDIR /app

COPY *.json .

RUN npm update && npm install

COPY . .

RUN chmod +x patch-webpack-dev-server.sh
RUN ./patch-webpack-dev-server.sh

CMD ["npm", "start"]
