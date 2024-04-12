FROM node:20-alpine

WORKDIR /app

COPY *.json .

RUN npm ci
RUN npm install socket.io @types/socket.io
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"]