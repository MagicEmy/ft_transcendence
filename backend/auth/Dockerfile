FROM node:20-alpine

WORKDIR /app

COPY *.json .

#otherwise fails
RUN	npm install -g npm@10.6.0
RUN npm ci

COPY . .

# how to copy a .env file from a central location?

RUN npm run build

CMD ["npm", "run", "start:dev"]