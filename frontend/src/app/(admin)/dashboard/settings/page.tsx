'use client';

import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/api';

type ConfigurationData = {
  companyName: string;
  cuit: string;
  email: string;
  phone: string;
  address: string;
};

export default function SettingsPage() {
  const [formData, setFormData] = useState<Partial<ConfigurationData>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL + '/configuration';

  useEffect(() => {
    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await authFetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }
            const data = await response.json();
            if (data && !data.error) {
                setFormData(data);
            }
        } catch (err) {
            console.error(err);
            setMessage('Error: No se pudo cargar la configuración de la API.');
        } finally {
            setLoading(false);
        }
    };
    fetchSettings();
  }, [apiUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('Guardando...');
    
    // --- INICIO DE LA CORRECCIÓN ---
    // Creamos un payload limpio solo con los campos editables
    const payload = {
      companyName: formData.companyName,
      cuit: formData.cuit,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
    };
    // --- FIN DE LA CORRECCIÓN ---

    try {
      const response = await authFetch(apiUrl, {
        method: 'PUT',
        body: JSON.stringify(payload), // Usamos el payload limpio
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error del backend:", errorData);
        throw new Error('Falló la solicitud de guardado.');
      }

      const result = await response.json();
      setMessage('¡Configuración guardada con éxito!');
      setFormData(result);
    } catch (error) {
      setMessage('Error al guardar la configuración.');
    }
  };
  
  return (
    <main className="max-w-2xl mx-auto p-8 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Configuración de la Empresa</h1>
      {loading ? <p>Cargando configuración...</p> : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
            <input type="text" name="companyName" id="companyName" value={formData.companyName || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="cuit" className="block text-sm font-medium text-gray-700">CUIT</label>
            <input type="text" name="cuit" id="cuit" value={formData.cuit || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
           <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="text" name="phone" id="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
           <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
            <input type="text" name="address" id="address" value={formData.address || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Guardar Cambios
            </button>
          </div>
        </form>
      )}
      {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
    </main>
  );
}