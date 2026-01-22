// Menu Filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const menuItems = document.querySelectorAll('.menu-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        menuItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// Simple Cart Functionality
let cart = [];

const addToCartButtons = document.querySelectorAll('.add-to-cart');

addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const menuItem = button.closest('.menu-item');
        const itemName = menuItem.querySelector('h3').textContent;
        const itemPrice = parseFloat(menuItem.querySelector('.price').textContent.replace('R$ ', '').replace(',', '.'));

        // Get selected flavor if flavor selection exists
        const flavorSelect = menuItem.querySelector('.flavor-select');
        const selectedFlavor = flavorSelect ? flavorSelect.value : null;
        const fullItemName = selectedFlavor ? `${itemName} - ${selectedFlavor}` : itemName;

        const existingItem = cart.find(item => item.name === fullItemName);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                name: fullItemName,
                price: itemPrice,
                quantity: 1
            });
        }

        updateCartDisplay();
        alert(`${fullItemName} adicionado ao carrinho!`);
        cartModal.style.display = 'block';
    });
});

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart modal
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>R$ ${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div class="cart-item-controls">
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
            </div>
        `;
        cartItems.appendChild(cartItemDiv);
    });

    cartTotal.textContent = total.toFixed(2);
}

// Cart Modal Functionality
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.querySelector('.close-cart');
const checkoutBtn = document.getElementById('checkout-btn');

cartIcon.addEventListener('click', () => {
    cartModal.style.display = 'block';
});

closeCart.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    // Check if payment method is selected
    const selectedPayment = document.querySelector('input[name="payment-method"]:checked');
    if (!selectedPayment) {
        alert('Por favor, selecione uma forma de pagamento.');
        return;
    }

    const paymentMethod = selectedPayment.value;
    let paymentDetails = paymentMethod;

    if (paymentMethod === 'Crédito') {
        const creditoOptions = document.getElementById('credito-options');
        const selectedCreditType = document.querySelector('input[name="credito-type"]:checked');
        if (!selectedCreditType) {
            // Show credit options if not already visible
            if (creditoOptions.style.display === 'none') {
                creditoOptions.style.display = 'block';
                alert('Por favor, selecione se é à vista ou parcelado.');
                return;
            } else {
                alert('Por favor, selecione se é à vista ou parcelado.');
                return;
            }
        }
        if (selectedCreditType.value === 'Parcelado') {
            const installments = document.getElementById('installments').value;
            paymentDetails += ` - Parcelado em ${installments}x`;
        } else {
            paymentDetails += ' - À vista';
        }
    }

    alert(`Pedido finalizado com ${paymentDetails}! Entraremos em contato para confirmar os detalhes.`);
    cart = [];
    updateCartDisplay();
    cartModal.style.display = 'none';
});

function changeQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartDisplay();
}

// Mobile Navigation
const hamburger = document.getElementById('hamburger');
const mobileNavLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    mobileNavLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
mobileNavLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        mobileNavLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Contact Form Submission
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // In a real app, you'd send this data to a server
    alert('Obrigado pela mensagem! Entraremos em contato em breve.');
    contactForm.reset();
});

// Smooth Scrolling for Navigation Links
const navLinks = document.querySelectorAll('.nav-links a');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(href);
            const headerHeight = document.querySelector('header').offsetHeight;

            window.scrollTo({
                top: targetSection.offsetTop - headerHeight,
                behavior: 'smooth'
            });
        }
        // If href doesn't start with '#', let the browser handle navigation to other pages
    });
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Payment method selection using event delegation
document.addEventListener('change', function(e) {
    if (e.target.name === 'payment-method') {
        const creditoOptions = document.getElementById('credito-options');
        if (creditoOptions) {
            if (e.target.value === 'Crédito') {
                creditoOptions.style.display = 'block';
                // Pre-select parcelado by default
                const parceladoRadio = document.querySelector('input[name="credito-type"][value="Parcelado"]');
                parceladoRadio.checked = true;
                // Enable installments since parcelado is selected
                const installmentsSelect = document.getElementById('installments');
                if (installmentsSelect) {
                    installmentsSelect.disabled = false;
                    installmentsSelect.value = '2';
                }
            } else {
                creditoOptions.style.display = 'none';
                // Reset credit options
                document.querySelectorAll('input[name="credito-type"]').forEach(radio => radio.checked = false);
                const installmentsSelect = document.getElementById('installments');
                if (installmentsSelect) {
                    installmentsSelect.disabled = true;
                    installmentsSelect.value = '2';
                }
            }
        }
    }

    if (e.target.name === 'credito-type') {
        const installmentsSelect = document.getElementById('installments');
        if (installmentsSelect) {
            if (e.target.value === 'Parcelado') {
                installmentsSelect.disabled = false;
            } else {
                installmentsSelect.disabled = true;
                installmentsSelect.value = '2';
            }
        }
    }
});



// PWA Installation Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Update UI to notify the user they can install the PWA
    showInstallButton();
});

function showInstallButton() {
    // Create an install button if it doesn't exist
    if (!document.querySelector('.install-btn')) {
        const installBtn = document.createElement('button');
        installBtn.textContent = 'Instalar App';
        installBtn.className = 'btn install-btn';
        installBtn.style.position = 'fixed';
        installBtn.style.bottom = '20px';
        installBtn.style.right = '20px';
        installBtn.style.zIndex = '1001';

        installBtn.addEventListener('click', () => {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
            });
        });

        document.body.appendChild(installBtn);
    }
}
