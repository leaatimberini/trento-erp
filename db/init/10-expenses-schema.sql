-- Crear tabla para las categorías de gastos
CREATE TABLE IF NOT EXISTS expense_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Insertar algunas categorías por defecto
INSERT INTO expense_categories(name) VALUES ('Sueldos'), ('Alquiler'), ('Servicios'), ('Combustible'), ('Marketing'), ('Impuestos'), ('Varios') ON CONFLICT (name) DO NOTHING;

-- Crear tabla para los gastos
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    expense_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    category_id INT REFERENCES expense_categories(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar 'updated_at' en gastos
CREATE TRIGGER set_timestamp_expenses
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Índices
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);