-- Modificar la tabla de órdenes para añadir el costo de envío
ALTER TABLE orders ADD COLUMN shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00;