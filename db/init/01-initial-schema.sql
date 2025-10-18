-- Crear la tabla para la configuración de la empresa
CREATE TABLE IF NOT EXISTS company_settings (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    cuit VARCHAR(20) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    
    -- API Keys (se recomienda encriptar en la aplicación antes de guardar)
    mercadolibre_app_id VARCHAR(255),
    mercadolibre_client_secret TEXT,
    
    -- AFIP Configuration
    afip_mode VARCHAR(20) DEFAULT 'homologacion', -- homologacion o produccion
    afip_cert_path VARCHAR(255),
    afip_key_path VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar 'updated_at' en cada modificación
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON company_settings
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
