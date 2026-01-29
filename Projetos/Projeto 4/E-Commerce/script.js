// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <span>${item.name} - R$ ${item.price}</span>
            <button onclick="removeFromCart(${index})">Remover</button>
        `;
        cartItems.appendChild(itemElement);
        // Fix for Brazilian currency: remove dots and replace comma with dot
        const numericPrice = parseFloat(item.price.replace(/\./g, '').replace(',', '.'));
        total += numericPrice;
    });

    cartTotal.textContent = total.toFixed(2);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = document.querySelector(`.product[data-id="${productId}"]`);
    const name = product.querySelector('h3').textContent;
    const price = product.querySelector('p').textContent.replace('R$ ', '');
    
    cart.push({ name, price });
    updateCartDisplay();
    alert('Produto adicionado ao carrinho!');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// Event listeners for add to cart buttons
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const productId = button.closest('.product').dataset.id;
        addToCart(productId);
    });
});

// Checkout functionality
document.getElementById('checkout-btn').addEventListener('click', () => {
    document.getElementById('products').style.display = 'none';
    document.getElementById('cart').style.display = 'none';
    document.getElementById('checkout').style.display = 'block';
    document.getElementById('delivery-section').style.display = 'block';
    document.getElementById('payment-section').style.display = 'none';
});

// CEP search functionality
document.getElementById('search-cep').addEventListener('click', async () => {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    const button = document.getElementById('search-cep');

    if (cep.length !== 8) {
        alert('Por favor, digite um CEP válido com 8 dígitos.');
        return;
    }

    button.disabled = true;
    button.textContent = 'Buscando...';

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            alert('CEP não encontrado. Verifique o CEP digitado.');
        } else {
            document.getElementById('endereco').value = data.logradouro || '';
            document.getElementById('cidade').value = data.localidade || '';
            document.getElementById('estado').value = data.uf || '';
            alert('Endereço preenchido automaticamente!');
        }
    } catch (error) {
        alert('Erro ao buscar CEP. Tente novamente.');
        console.error('Erro na busca do CEP:', error);
    } finally {
        button.disabled = false;
        button.textContent = 'Buscar CEP';
    }
});

// Delivery confirmation
document.getElementById('confirm-delivery').addEventListener('click', () => {
    const cep = document.getElementById('cep').value;
    const endereco = document.getElementById('endereco').value;
    const numero = document.getElementById('numero').value;
    const cidade = document.getElementById('cidade').value;
    const estado = document.getElementById('estado').value;

    if (!cep || !endereco || !numero || !cidade || !estado) {
        alert('Por favor, preencha todos os campos de entrega.');
        return;
    }

    // Calculate delivery time (3-5 business days)
    const deliveryDays = Math.floor(Math.random() * 3) + 3; // 3 to 5 days
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

    // Store delivery info
    localStorage.setItem('delivery_info', JSON.stringify({
        cep,
        endereco,
        numero,
        cidade,
        estado,
        deliveryDate: deliveryDate.toISOString().split('T')[0],
        deliveryDays
    }));

    // Show payment section
    document.getElementById('delivery-section').style.display = 'none';
    document.getElementById('payment-section').style.display = 'block';

    alert(`Entrega confirmada! Prazo estimado: ${deliveryDays} dias úteis (${deliveryDate.toLocaleDateString('pt-BR')}).`);
});

// Payment method handling
document.getElementById('payment-method').addEventListener('change', (e) => {
    const paymentDetails = document.getElementById('payment-details');
    const method = e.target.value;
    
    switch(method) {
        case 'credit':
        case 'debit':
            paymentDetails.innerHTML = `
                <label for="card-number">Número do Cartão:</label>
                <input type="text" id="card-number" placeholder="1234 5678 9012 3456" required>
                <label for="expiry">Data de Expiração:</label>
                <input type="text" id="expiry" placeholder="MM/AA" required>
                <label for="cvv">CVV:</label>
                <input type="text" id="cvv" placeholder="123" required>
            `;
            break;
        case 'pix':
            paymentDetails.innerHTML = `
                <p>Escaneie o QR Code do Pix ou use a chave PIX: loja@eletronicos.com</p>
                <div style="text-align: center; margin: 1rem 0;">
                    <img id="pix-qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021126580014br.gov.bcb.pix0136loja@eletronicos.com5204000053039865802BR5914Loja Eletronicos6009SAO PAULO62070503***6304" alt="QR Code Pix" style="max-width: 200px; height: auto;">
                </div>
            `;
            break;
        case 'cash':
            paymentDetails.innerHTML = `
                <p>Pagamento em dinheiro na entrega.</p>
                <label for="change">Troco para:</label>
                <input type="text" id="change" placeholder="R$ 0,00 (deixe em branco se não precisar)">
            `;
            break;
    }
});

// Payment form submission
document.getElementById('payment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const method = document.getElementById('payment-method').value;

    // Get delivery info
    const deliveryInfo = JSON.parse(localStorage.getItem('delivery_info')) || {};

    // Record the sale
    const saleData = {
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        items: cart.map(item => ({
            product: item.name,
            quantity: 1, // Assuming 1 per cart item for simplicity
            amount: parseFloat(item.price.replace(/\./g, '').replace(',', '.'))
        })),
        totalAmount: cart.reduce((sum, item) => sum + parseFloat(item.price.replace(/\./g, '').replace(',', '.')), 0),
        paymentMethod: method,
        delivery: deliveryInfo,
        status: 'pending' // New field to track order status
    };

    // Save sale to localStorage
    const existingSales = JSON.parse(localStorage.getItem('store_sales')) || [];
    existingSales.push(saleData);
    localStorage.setItem('store_sales', JSON.stringify(existingSales));

    // Update inventory (reduce stock)
    const inventory = JSON.parse(localStorage.getItem('admin_inventory')) || [];
    cart.forEach(cartItem => {
        const inventoryItem = inventory.find(inv => inv.name === cartItem.name);
        if (inventoryItem && inventoryItem.stock > 0) {
            inventoryItem.stock -= 1;
            inventoryItem.salesToday = (inventoryItem.salesToday || 0) + 1;
        }
    });
    localStorage.setItem('admin_inventory', JSON.stringify(inventory));

    // Simulate payment processing
    alert(`Pagamento via ${method} processado com sucesso! Obrigado pela compra.\n\nNota: Atualize a página do painel administrativo para ver as vendas atualizadas.`);

    // Clear cart and redirect to products
    cart = [];
    updateCartDisplay();
    document.getElementById('checkout').style.display = 'none';
    document.getElementById('products').style.display = 'block';
    document.getElementById('cart').style.display = 'block';
});

// Load products from localStorage or use defaults
function loadProducts() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) {
        console.error('Product grid element not found');
        return;
    }

    // Load inventory from localStorage
    let inventory = JSON.parse(localStorage.getItem('admin_inventory'));

    if (!inventory) {
        inventory = [
            { id: 1, name: 'Smart TV 55” TCL 55C6K 4K', stock: 5, price: 3900.00, cost: 3900.00, salesToday: 0, image: 'Imagem/Smart TV 55” TCL 55C6K 4K QD-Mini Led 144Hz Sistema Operacional Google TV.jpeg' },
            { id: 2, name: 'Apple iPhone 16 (128 GB) – Preto', stock: 10, price: 5000.00, cost: 4000.00, salesToday: 0, image: 'Imagem/Apple-iPhone-17-Pro-color-lineup_.webp' },
            { id: 3, name: 'Controle Sony DualSense PS5, Sem Fio, Branco', stock: 15, price: 350.00, cost: 250.00, salesToday: 0, image: 'Imagem/Controle Sony DualSense PS5, Sem Fio, Branco.webp' },
            { id: 4, name: 'PlayStation 5 Edição Digital 825GB', stock: 10, price: 4500.00, cost: 4000.00, salesToday: 0, image: 'Imagem/PS5.jfif' }
        ];
        localStorage.setItem('admin_inventory', JSON.stringify(inventory));
    }

    console.log('Loading products:', inventory);

    productGrid.innerHTML = '';

    inventory.forEach((product, index) => {
        const productElement = document.createElement('div');
        productElement.className = 'product' + (index === 0 ? ' featured' : '');
        productElement.setAttribute('data-id', product.id);

        productElement.innerHTML = `
            <div class="product-3d">
                <img src="${product.image || 'Imagem/Smart TV 55” TCL 55C6K 4K QD-Mini Led 144Hz Sistema Operacional Google TV.jpeg'}" alt="${product.name}" class="product-image" data-product-id="${product.id}">
            </div>
            <h3>${product.name}</h3>
            <p>R$ ${product.price.toFixed(2).replace('.', ',')}</p>
            <button class="add-to-cart">Adicionar ao Carrinho</button>
        `;

        productGrid.appendChild(productElement);
    });

    // Re-attach event listeners for add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.closest('.product').dataset.id;
            addToCart(productId);
        });
    });
}

// Initialize cart display and load products on page load
updateCartDisplay();
loadProducts();

// Contact form functionality
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const contactMessage = {
                id: Date.now(),
                date: new Date().toISOString(),
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                status: 'unread'
            };

            // Save to localStorage
            const existingMessages = JSON.parse(localStorage.getItem('contact_messages')) || [];
            existingMessages.push(contactMessage);
            localStorage.setItem('contact_messages', JSON.stringify(existingMessages));

            // Show success message
            alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');

            // Reset form
            contactForm.reset();
        });
    }
});

// Event listener for product image clicks to change image
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('product-image')) {
        const productId = e.target.dataset.productId;
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataUrl = e.target.result;
                    // Update the image src
                    const imgElement = document.querySelector(`.product-image[data-product-id="${productId}"]`);
                    if (imgElement) {
                        imgElement.src = dataUrl;
                    }
                    // Update the inventory in localStorage
                    const inventory = JSON.parse(localStorage.getItem('admin_inventory')) || [];
                    const product = inventory.find(p => p.id == productId);
                    if (product) {
                        product.image = dataUrl;
                        localStorage.setItem('admin_inventory', JSON.stringify(inventory));
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click();
    }
});
