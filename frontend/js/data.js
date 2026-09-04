// js/data.js
var productsData = [];

async function loadProducts() {
    try {
        const apiUrl = window.API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/products`);
        const result = await response.json();
        if (result.message === 'success') {
            productsData = result.data;
        } else {
            console.error('Error fetching products:', result);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
    
    // Dispatch an event so other scripts know data is ready
    document.dispatchEvent(new Event('productsLoaded'));
}

// Start loading
loadProducts();
