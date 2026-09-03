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
    const prodDescInput = document.getElementById('prod-desc');

    // URL BASE ESTRICTA
    const API_URL = 'http://localhost:3000/api';

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
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            // Verificamos si la respuesta es texto plano/HTML en lugar de JSON
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

    function getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
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
            tr.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
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
        prodImageInput.value = product.image;
        prodDescInput.value = product.description;

        productForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    cancelEditBtn.addEventListener('click', () => {
        resetForm();
    });

    function resetForm() {
        productForm.reset();
        prodIdInput.value = '';
        formTitle.textContent = 'Nuevo Producto';
        cancelEditBtn.classList.add('hidden');
    }

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const productData = {
            name: prodNameInput.value,
            price: Number(prodPriceInput.value),
            category: prodCategoryInput.value,
            image: prodImageInput.value,
            description: prodDescInput.value
        };

        const id = prodIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(productData)
            });

            if (res.ok) {
                resetForm();
                fetchProducts();
            } else {
                const error = await res.json();
                if (res.status === 401 || res.status === 403) {
                    alert('Tu sesión ha expirado o no tienes permisos.');
                    localStorage.removeItem('token');
                    checkAuthStatus();
                } else {
                    alert('Error: ' + error.error);
                }
            }
        } catch (error) {
            console.error('Error guardando producto:', error);
            alert('Error de conexión.');
        }
    });

    async function deleteProduct(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) return;

        try {
            const res = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
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