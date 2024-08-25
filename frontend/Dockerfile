# FROM node:20-alpine

# WORKDIR /app

# COPY *.json .

# ENV NODE_OPTIONS=--no-warnings

# RUN npm update && npm install

# COPY . .

# EXPOSE 3000

# CMD ["npm", "start"]

FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/build ./build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
