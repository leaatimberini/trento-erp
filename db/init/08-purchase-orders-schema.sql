-- Crear una enumeración para el estado de la orden de compra
CREATE TYPE purchase_order_status AS ENUM ('pending', 'partially_received', 'fully_received', 'cancelled');

-- Crear la tabla para las órdenes de compra
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_delivery_date TIMESTAMPTZ,
    status purchase_order_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear la tabla para los ítems de una orden de compra
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    cost_per_unit NUMERIC(10, 2) NOT NULL CHECK (cost_per_unit >= 0),
    
    UNIQUE(purchase_order_id, product_id)
);

-- Triggers para timestamps
CREATE TRIGGER set_timestamp_purchase_orders
BEFORE UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Índices
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id ON purchase_order_items(product_id);