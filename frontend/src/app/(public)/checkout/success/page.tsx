import Link from 'next/link';

export default function CheckoutSuccessPage() {
    return (
        <main className="text-center p-10">
            <h1 className="text-3xl font-bold text-green-600 mb-4">¡Pago Exitoso!</h1>
            <p className="text-gray-700">Gracias por su compra. Su orden ha sido procesada correctamente.</p>
            <Link href="/dashboard/orders" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-md">
                Ver mis Órdenes
            </Link>
        </main>
    );
}