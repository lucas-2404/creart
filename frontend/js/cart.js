// js/cart.js
document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('creart_cart')) || [];
    const cartBadge = document.getElementById('cart-badge');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const emptyMsg = document.querySelector('.empty-cart-msg');

    // Save cart to local storage
    function saveCart() {
        localStorage.setItem('creart_cart', JSON.stringify(cart));
        updateCartBadge();

        // Only re-render if the cart view is currently active
        const carritoView = document.getElementById('carrito');
        if (carritoView && carritoView.classList.contains('active-view')) {
            renderCart();
        }
    }

    // Update Badge
    function updateCartBadge() {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartBadge.textContent = totalItems;
        if (totalItems === 0) {
            cartBadge.style.display = 'none';
        } else {
            cartBadge.style.display = 'flex';
        }
    }

    // Add item to cart
    function addToCart(productId) {
        const product = productsData.find(p => p.id === parseInt(productId));
        if (!product) return;

        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCart();

        // Visual feedback
        const btn = document.querySelector(`.add-to-cart[data-id="${productId}"]`);
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = "¡Agregado!";
            btn.style.backgroundColor = "var(--color-wood-light)";
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = "";
            }, 1000);
        }
    }

    // Remove item from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== parseInt(productId));
        saveCart();
    }

    // Update quantity
    function updateQuantity(productId, amount) {
        const item = cart.find(item => item.id === parseInt(productId));
        if (item) {
            item.quantity += amount;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
            }
        }
    }

    // Render Cart Items
    function renderCart() {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            if (emptyMsg) cartItemsContainer.appendChild(emptyMsg);
            if (emptyMsg) emptyMsg.style.display = 'block';
            if (checkoutBtn) checkoutBtn.disabled = true;
            if (cartSubtotal) cartSubtotal.textContent = '$0';
            if (cartTotal) cartTotal.textContent = '$0';
            return;
        }

        if (emptyMsg) emptyMsg.style.display = 'none';
        if (checkoutBtn) checkoutBtn.disabled = false;

        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const div = document.createElement('div');
            div.classList.add('cart-item');
            const imgSrc = (item.image && (item.image.startsWith('http') || item.image.startsWith('./')))
                ? item.image 
                : (item.image && item.image.startsWith('/img/') 
                    ? (window.location.port === '3000' ? item.image : `http://localhost:3000${item.image}`) 
                    : './img/logocreart.png');
            div.innerHTML = `
                <img src="${imgSrc}" alt="${item.name}" class="cart-item__img" onerror="this.src='./img/logocreart.png'">
                <div class="cart-item__details">
                    <h4 class="cart-item__title">${item.name}</h4>
                    <p class="cart-item__price">$${item.price}</p>
                </div>
                <div class="cart-item__quantity">
                    <button class="qty-btn minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn plus" data-id="${item.id}">+</button>
                </div>
                <button class="cart-item__remove" data-id="${item.id}">Eliminar</button>
            `;
            cartItemsContainer.appendChild(div);
        });

        if (cartSubtotal) cartSubtotal.textContent = `$${total}`;
        if (cartTotal) cartTotal.textContent = `$${total}`;

        attachCartEvents();
    }

    function attachCartEvents() {
        // Minus buttons
        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                updateQuantity(e.target.dataset.id, -1);
            });
        });

        // Plus buttons
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                updateQuantity(e.target.dataset.id, 1);
            });
        });

        // Remove buttons
        document.querySelectorAll('.cart-item__remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                removeFromCart(e.target.dataset.id);
            });
        });
    }

    // Listen for add to cart clicks globally (since product cards are rendered dynamically)
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            addToCart(e.target.dataset.id);
        }
    });

    // Setup checkout button action — WhatsApp redirect
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;

            // Construir mensaje formateado para WhatsApp
            let mensaje = '🛍️ *Hola Creart, quiero hacer el siguiente pedido:*\n\n';
            let total = 0;

            cart.forEach((item, index) => {
                const subtotal = item.price * item.quantity;
                total += subtotal;

                mensaje += `▪️ *${item.name}*\n`;
                mensaje += `   Cantidad: ${item.quantity}\n`;
                mensaje += `   Precio unitario: $${item.price.toLocaleString('es-AR')}\n`;
                mensaje += `   Subtotal: $${subtotal.toLocaleString('es-AR')}\n`;

                if (index < cart.length - 1) mensaje += '\n';
            });

            mensaje += `\n──────────────────\n`;
            mensaje += `💰 *TOTAL A PAGAR: $${total.toLocaleString('es-AR')}*\n`;
            mensaje += `\n¡Gracias! 😊`;

            // Codificar y redirigir a WhatsApp
            const whatsappURL = `https://wa.me/5493815171491?text=${encodeURIComponent(mensaje)}`;
            window.open(whatsappURL, '_blank');

            // Vaciar carrito después de abrir WhatsApp
            cart = [];
            saveCart();
        });
    }

    // Initialize
    updateCartBadge();

    // Setup observer to render cart when view becomes active
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'carrito' && mutation.target.classList.contains('active-view')) {
                renderCart();
            }
        });
    });

    const carritoView = document.getElementById('carrito');
    if (carritoView) {
        observer.observe(carritoView, { attributes: true, attributeFilter: ['class'] });
    }
});
