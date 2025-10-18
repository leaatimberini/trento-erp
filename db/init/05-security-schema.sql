-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- Ej: 'admin', 'customer'
);

-- Insertar roles iniciales
INSERT INTO roles(name) VALUES ('admin'), ('customer') ON CONFLICT (name) DO NOTHING;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Se almacenará el hash, no la contraseña en texto plano
    role_id INT NOT NULL REFERENCES roles(id),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL, -- Enlace opcional a un cliente

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar 'updated_at' en usuarios
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_customer_id ON users(customer_id);