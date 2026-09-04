// js/config.js — Configuración para Producción (Vercel + Render)

(function () {
    // =========================================================================
    // CONFIGURACIÓN DE PRODUCCIÓN - RENDER & VERCEL
    // =========================================================================
    const RENDER_BACKEND_URL = 'https://creart-backend.onrender.com';
    const RENDER_API_URL = `${RENDER_BACKEND_URL}/api`;

    // Permite sobreescritura dinámica si se requiere (por ejemplo: desarrollo local explícito con localStorage)
    const customBackendUrl = window.CUSTOM_BACKEND_URL || localStorage.getItem('creart_backend_url');
    const isLocalExplicit = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && localStorage.getItem('use_local_backend') === 'true';

    const BACKEND_URL = customBackendUrl || (isLocalExplicit ? 'http://localhost:3000' : RENDER_BACKEND_URL);
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

    console.log(`[Creart Config] Conectado a la API: ${API_URL}`);
})();
