// js/contact.js — Lógica del formulario de contacto con WhatsApp dinámico

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !message) return;

        // --- Estado de carga en el botón ---
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        // --- Guardar lead en segundo plano (no bloquea la experiencia) ---
        try {
            const apiUrl = window.API_URL || 'https://creart-backend.onrender.com/api';
            await fetch(`${apiUrl}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, message })
            });
        } catch (err) {
            // Si falla el guardado, igual abre WhatsApp. El usuario no se ve afectado.
            console.warn('No se pudo guardar el lead:', err);
        }

        // --- Construir URL dinámica de WhatsApp ---
        const whatsappNumber = '5493815171491';
        const textoMensaje = `Hola, soy ${name}. Quiero consultar esto: ${message}`;
        const urlWhatsApp = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(textoMensaje)}`;

        // --- Abrir WhatsApp en nueva pestaña ---
        window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');

        // --- Resetear el formulario ---
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Mensaje';
    });
});
