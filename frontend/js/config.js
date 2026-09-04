// js/config.js — Configuración dinámica de entorno (Desarrollo vs Producción)

(function () {
    // Detección automática de entorno local (localhost o 127.0.0.1)
    const isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '[::1]'
    );

    // =========================================================================
    // CONFIGURACIÓN DE URLs
    // =========================================================================
    // En desarrollo local apunta a http://localhost:3000.
    // En producción (ej. Vercel), cambiar 'https://creart-backend.onrender.com' por la URL de tu backend en Render o Railway.
    // También puedes sobreescribirla en caliente desde la consola o navegador con:
    //   localStorage.setItem('creart_backend_url', 'https://tu-backend.up.railway.app')
    // =========================================================================
    const PROD_BACKEND_URL = 'https://creart-backend.onrender.com';

    const customBackendUrl = window.CUSTOM_BACKEND_URL || localStorage.getItem('creart_backend_url');
    const BACKEND_URL = customBackendUrl || (isLocalhost ? 'http://localhost:3000' : PROD_BACKEND_URL);
    const API_URL = `${BACKEND_URL}/api`;

    /**
     * Resuelve la URL completa de una imagen para que funcione tanto en local como en producción.
     * @param {string} imagePath - Ruta relativa o absoluta de la imagen.
     * @returns {string} URL resuelta para el atributo src.
     */
    function resolveImageUrl(imagePath) {
        if (!imagePath) return './img/logocreart.png';

        // Si ya es una URL absoluta o base64
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
            return imagePath;
        }

        // Si es un recurso estático relativo al frontend
        if (imagePath.startsWith('./img/')) {
            return imagePath;
        }

        // Si es una ruta servida por el backend (/img/...)
        if (imagePath.startsWith('/img/')) {
            return `${BACKEND_URL}${imagePath}`;
        }

        // Nombre de archivo directo almacenado en backend
        return `${BACKEND_URL}/img/${imagePath}`;
    }

    // Exponer de forma global para todos los scripts
    window.BACKEND_URL = BACKEND_URL;
    window.API_URL = API_URL;
    window.resolveImageUrl = resolveImageUrl;

    console.log(`[Creart Config] Modo: ${isLocalhost ? 'Desarrollo (Local)' : 'Producción'} | Backend: ${BACKEND_URL}`);
})();
