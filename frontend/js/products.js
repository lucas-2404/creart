// js/products.js
document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('products-grid');
    const featuredGrid = document.getElementById('featured-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    function resolveImageUrl(imagePath) {
        if (!imagePath) return './img/logocreart.png';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        if (imagePath.startsWith('./img/')) {
            return imagePath;
        }
        if (imagePath.startsWith('/img/')) {
            return window.location.port === '3000' ? imagePath : `http://localhost:3000${imagePath}`;
        }
        return `http://localhost:3000/img/${imagePath}`;
    }

    // Render Product Card
    function createProductCard(product) {
        const card = document.createElement('div');
        card.classList.add('product-card');
        const imgSrc = resolveImageUrl(product.image);
        card.innerHTML = `
            <img src="${imgSrc}" alt="${product.name}" class="product-card__img" loading="lazy" onerror="this.src='./img/logocreart.png'">
            <div class="product-card__content">
                <span class="product-card__material">${product.category}</span>
                <h3 class="product-card__title">${product.name}</h3>
                <p class="product-card__desc">${product.description}</p>
                <div class="product-card__footer">
                    <span class="product-card__price">$${product.price}</span>
                    <button class="btn btn--primary add-to-cart" data-id="${product.id}">Agregar</button>
                </div>
            </div>
        `;
        return card;
    }

    // Render all products
    function renderProducts(products, container) {
        container.innerHTML = '';
        products.forEach(product => {
            container.appendChild(createProductCard(product));
        });
    }

    function initProducts() {
        // Initialize Products View
        if (productsGrid) {
            renderProducts(productsData, productsGrid);
        }

        // Initialize Featured View (first 3)
        if (featuredGrid) {
            renderProducts(productsData.slice(0, 3), featuredGrid);
        }
    }

    if (productsData && productsData.length > 0) {
        initProducts();
    } else {
        document.addEventListener('productsLoaded', initProducts);
    }

    // Filtering logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            
            if (filter === 'all') {
                renderProducts(productsData, productsGrid);
            } else {
                const filtered = productsData.filter(p => p.category === filter);
                renderProducts(filtered, productsGrid);
            }
        });
    });
});
