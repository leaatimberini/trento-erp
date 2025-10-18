import Link from 'next/link';

export default function CheckoutFailurePage() {
    return (
        <main className="text-center p-10">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Pago Rechazado</h1>
            <p className="text-gray-700">Hubo un problema al procesar su pago. Por favor, intente nuevamente.</p>
            <Link href="/cart" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-md">
                Volver al Carrito
            </Link>
        </main>
    );
}