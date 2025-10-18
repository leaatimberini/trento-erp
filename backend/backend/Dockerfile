# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Ya no necesitamos las herramientas de compilación
# RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Stage 2: Production
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app ./

RUN npm install -g @nestjs/cli

EXPOSE 3000

CMD ["npm", "run", "start:dev"]