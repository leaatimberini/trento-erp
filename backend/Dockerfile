# Stage 1: Build (Compilación)
FROM node:18-alpine AS builder

# --- PARCHE DE SEGURIDAD ---
RUN apk update && apk upgrade
# --- FIN DE PARCHE ---

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---
# Stage 2: Production (Ejecución)
FROM node:18-alpine

# --- PARCHE DE SEGURIDAD ---
RUN apk update && apk upgrade
# --- FIN DE PARCHE ---

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "start:prod"]