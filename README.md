# ERP TRENTO Bebidas - Entorno de Desarrollo

## Requisitos
- Docker
- Docker Compose

## Levantamiento del Entorno
1. Crear un archivo `.env` a partir del `.env.example`.
2. Desde la carpeta raíz del proyecto, ejecutar `docker-compose up -d --build`.
3. El backend estará disponible en `http://localhost:3000`.
4. Para detener los servicios, ejecutar `docker-compose down`.
