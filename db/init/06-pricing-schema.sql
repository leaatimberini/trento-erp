-- Crear tabla para las listas de precios
CREATE TABLE IF NOT EXISTS price_lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    margin_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- Ej: 40.00 para un 40%
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar listas de precios por defecto con sus márgenes
INSERT INTO price_lists(name, description, margin_percentage) VALUES ('Consumidor Final', 'Lista de precios minorista para la tienda web pública.', 40.00) ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, margin_percentage = EXCLUDED.margin_percentage;
INSERT INTO price_lists(name, description, margin_percentage) VALUES ('Mayorista', 'Lista de precios para compras por volumen.', 15.00) ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, margin_percentage = EXCLUDED.margin_percentage;


-- Modificar la tabla de clientes para asociar una lista de precios
-- (Esta parte no cambia)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS price_list_id INT;

ALTER TABLE customers 
ADD CONSTRAINT fk_price_list 
FOREIGN KEY (price_list_id) 
REFERENCES price_lists(id)
ON DELETE SET NULL;

-- Modificar la tabla de productos para que el costo sea obligatorio
-- (Esta parte no cambia)
ALTER TABLE products ALTER COLUMN cost SET NOT NULL;