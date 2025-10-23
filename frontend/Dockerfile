FROM node:18-alpine

# --- PARCHE DE SEGURIDAD ---
RUN apk update && apk upgrade
# --- FIN DE PARCHE ---

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["sh", "-c", "npm run build && npm start"]