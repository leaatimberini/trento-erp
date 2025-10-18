-- Crear tabla para las rutas de reparto
CREATE TABLE IF NOT EXISTS delivery_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_name VARCHAR(255) NOT NULL,
    route_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para el timestamp
CREATE TRIGGER set_timestamp_delivery_routes
BEFORE UPDATE ON delivery_routes
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Modificar la tabla de órdenes para asociar una ruta de reparto
ALTER TABLE orders ADD COLUMN delivery_route_id UUID;

ALTER TABLE orders 
ADD CONSTRAINT fk_delivery_route 
FOREIGN KEY (delivery_route_id) 
REFERENCES delivery_routes(id)
ON DELETE SET NULL;