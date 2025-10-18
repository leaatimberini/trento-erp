// Esta función envuelve a fetch para añadir automáticamente el token de autenticación.
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = sessionStorage.getItem('accessToken');

    const headers = new Headers(options.headers || {});
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    
    // Asegurarnos de que el Content-Type se establezca si hay un body
    if (options.body && !headers.has('Content-Type')) {
        headers.append('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Si el token es inválido o expiró, limpiamos la sesión y redirigimos a login
        sessionStorage.removeItem('accessToken');
        // Usamos location.href para una redirección forzada del navegador
        window.location.href = '/login';
        // Lanzamos un error para detener la ejecución actual
        throw new Error('Sesión inválida o expirada.');
    }

    return response;
}