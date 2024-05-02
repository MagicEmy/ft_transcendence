FROM node:20-alpine

WORKDIR /app

COPY *.json .

RUN npm update && npm ci

COPY . .

# how to copy a .env file from a central location?

RUN npm run build

CMD ["npm", "run", "start:dev"]