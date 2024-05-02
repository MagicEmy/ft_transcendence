FROM node:20-alpine

WORKDIR /app

COPY *.json .

RUN npm install -g npm@10.5.2 && npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "start:dev"]