-- Crear un tipo para el estado de pago de una orden
CREATE TYPE order_payment_status AS ENUM ('unpaid', 'partially_paid', 'paid');

-- Modificar la tabla de órdenes para incluir el estado de pago
ALTER TABLE orders ADD COLUMN payment_status order_payment_status NOT NULL DEFAULT 'unpaid';

-- Crear tabla para registrar los pagos de los clientes
CREATE TABLE IF NOT EXISTS customer_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50), -- Ej: 'Efectivo', 'Transferencia', 'Mercado Pago'
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_customer_payments_customer_id ON customer_payments(customer_id);