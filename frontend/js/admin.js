document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const adminSection = document.getElementById('admin-section');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const productsTableBody = document.querySelector('#products-table tbody');
    const productForm = document.getElementById('product-form');
    const formTitle = document.getElementById('form-title');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    const prodIdInput = document.getElementById('prod-id');
    const prodNameInput = document.getElementById('prod-name');
    const prodPriceInput = document.getElementById('prod-price');
    const prodCategoryInput = document.getElementById('prod-category');
    const prodImageInput = document.getElementById('prod-image');
    const imageCurrentInfo = document.getElementById('image-current-info');
    const prodDescInput = document.getElementById('prod-desc');

    // URL BASE DINÁMICA (Localhost vs Producción)
    const API_URL = window.API_URL || 'http://localhost:3000/api';

    checkAuthStatus();

    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            loginSection.classList.add('hidden');
            adminSection.classList.remove('hidden');
            fetchProducts();
        } else {
            loginSection.classList.remove('hidden');
            adminSection.classList.add('hidden');
        }
    }

    // LOGIN
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const textResponse = await res.text();
            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (err) {
                console.error("El servidor respondió con HTML en lugar de JSON:", textResponse);
                throw new Error("El servidor no devolvió una respuesta válida (Revisa la ruta del API).");
            }

            if (res.ok) {
                localStorage.setItem('token', data.token);
                loginError.classList.add('hidden');
                loginForm.reset();
                checkAuthStatus();
            } else {
                loginError.textContent = data.error || 'Error al iniciar sesión';
                loginError.classList.remove('hidden');
            }
        } catch (error) {
            loginError.textContent = error.message || 'Error de conexión con el servidor.';
            loginError.classList.remove('hidden');
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        checkAuthStatus();
    });

    function resolveImageUrl(imagePath) {
        if (typeof window.resolveImageUrl === 'function') {
            return window.resolveImageUrl(imagePath);
        }
        if (!imagePath) return './img/logocreart.png';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        if (imagePath.startsWith('./img/')) {
            return imagePath;
        }
        const backendUrl = window.BACKEND_URL || 'http://localhost:3000';
        if (imagePath.startsWith('/img/')) {
            return `${backendUrl}${imagePath}`;
        }
        return `${backendUrl}/img/${imagePath}`;
    }

    async function fetchProducts() {
        try {
            const res = await fetch(`${API_URL}/products`);
            const json = await res.json();
            if (res.ok) {
                renderTable(json.data);
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
        }
    }

    function renderTable(products) {
        productsTableBody.innerHTML = '';
        products.forEach(product => {
            const tr = document.createElement('tr');
            const imgSrc = resolveImageUrl(product.image);
            tr.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${imgSrc}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.src='./img/logocreart.png'"></td>
                <td><strong>${product.name}</strong></td>
                <td>$${product.price}</td>
                <td><span style="text-transform: capitalize; background: #EEF2FF; color: #4F46E5; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem;">${product.category}</span></td>
                <td class="actions">
                    <button class="btn btn-small edit-btn" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>Editar</button>
                    <button class="btn btn-small btn-danger delete-btn" data-id="${product.id}">Eliminar</button>
                </td>
            `;
            productsTableBody.appendChild(tr);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => loadProductIntoForm(JSON.parse(e.target.dataset.product)));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteProduct(e.target.dataset.id));
        });
    }

    function loadProductIntoForm(product) {
        formTitle.textContent = 'Editar Producto';
        cancelEditBtn.classList.remove('hidden');

        prodIdInput.value = product.id;
        prodNameInput.value = product.name;
        prodPriceInput.value = product.price;
        prodCategoryInput.value = product.category;
        
        // Limpiamos el input file para no causar error DOMException
        prodImageInput.value = '';
        if (imageCurrentInfo) {
            const filename = product.image ? product.image.split('/').pop() : 'sin imagen';
            imageCurrentInfo.innerHTML = `📷 <strong>Imagen actual:</strong> ${filename} <br><span style="color: #6B7280; font-size: 0.75rem;">(Selecciona un archivo solo si deseas cambiarla)</span>`;
            imageCurrentInfo.classList.remove('hidden');
        }

        prodDescInput.value = product.description || '';

        productForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    cancelEditBtn.addEventListener('click', () => {
        resetForm();
    });

    function resetForm() {
        productForm.reset();
        prodIdInput.value = '';
        prodImageInput.value = '';
        if (imageCurrentInfo) {
            imageCurrentInfo.innerHTML = '';
            imageCurrentInfo.classList.add('hidden');
        }
        formTitle.textContent = 'Nuevo Producto';
        cancelEditBtn.classList.add('hidden');
    }

    // ENVÍO DEL FORMULARIO CON MULTIPART/FORM-DATA
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', prodNameInput.value.trim());
        formData.append('price', prodPriceInput.value);
        formData.append('category', prodCategoryInput.value);
        formData.append('description', prodDescInput.value.trim());

        // Anexar archivo de imagen solo si se seleccionó uno
        if (prodImageInput.files && prodImageInput.files[0]) {
            formData.append('image', prodImageInput.files[0]);
        }

        const id = prodIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;

        const token = localStorage.getItem('token');

        try {
            // Se envía FormData sin header Content-Type para que el navegador asigne multipart/form-data automáticamente con su boundary
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                resetForm();
                fetchProducts();
            } else {
                let errorMsg = 'Error al guardar el producto';
                try {
                    const error = await res.json();
                    errorMsg = error.error || errorMsg;
                } catch (_) {}

                if (res.status === 401 || res.status === 403) {
                    alert('Tu sesión ha expirado o no tienes permisos.');
                    localStorage.removeItem('token');
                    checkAuthStatus();
                } else {
                    alert('Error: ' + errorMsg);
                }
            }
        } catch (error) {
            console.error('Error guardando producto:', error);
            alert('Error de conexión con el servidor.');
        }
    });

    async function deleteProduct(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                fetchProducts();
            } else {
                if (res.status === 401 || res.status === 403) {
                    alert('Tu sesión ha expirado o no tienes permisos.');
                    localStorage.removeItem('token');
                    checkAuthStatus();
                } else {
                    alert('Error al eliminar el producto');
                }
            }
        } catch (error) {
            console.error('Error eliminando producto:', error);
        }
    }
});