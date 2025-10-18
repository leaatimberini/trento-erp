-- Crear tabla para los proveedores
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    cuit VARCHAR(20) UNIQUE,
    address TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar 'updated_at' en proveedores
CREATE TRIGGER set_timestamp_suppliers
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_cuit ON suppliers(cuit);