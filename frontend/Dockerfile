
# Build stage
FROM node:20.17.0-alpine3.19 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG REACT_APP_HOST
ENV REACT_APP_HOST=$REACT_APP_HOST
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/build ./build
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]

# Development stage
# FROM node:20-alpine
# WORKDIR /app
# COPY *.json .
# ENV NODE_OPTIONS=--no-warnings
# RUN npm update && npm install
# COPY . .
# CMD ["npm", "start"]
