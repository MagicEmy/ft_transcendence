FROM node:20-alpine

WORKDIR /app

COPY *.json .

RUN	npm install -g npm@10.5.2
RUN npm ci
RUN npm install socket.io @types/socket.io
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"]