// Menu Filtering with smooth animations
const filterButtons = document.querySelectorAll('.filter-btn');
const menuItems = document.querySelectorAll('.menu-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        menuItems.forEach((item, index) => {
            const category = item.getAttribute('data-category');
            
            if (filterValue === 'all' || category === filterValue) {
                // Show item with animation
                item.classList.remove('hidden');
                item.style.animation = 'none';
                item.offsetHeight; // Trigger reflow
                item.style.animation = `fadeInItem 0.5s ease-out ${index * 0.1}s both`;
            } else {
                // Hide item
                item.classList.add('hidden');
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
        
        // Show success feedback
        showNotification(`${fullItemName} adicionado ao carrinho! 🛒`);
        cartModal.style.display = 'block';
    });
});

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #e91e63, #ff4081);
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(233, 30, 99, 0.4);
        z-index: 3000;
        animation: slideInRight 0.4s ease-out;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Animate cart count
    cartCount.style.animation = 'none';
    cartCount.offsetHeight; // Trigger reflow
    cartCount.style.animation = 'pulse 0.3s ease';

    // Update cart modal
    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 30px 0;">Seu carrinho está vazio 🧁</p>';
    } else {
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
    }

    cartTotal.textContent = total.toFixed(2);
}

// Cart Modal Functionality
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.querySelector('.close-cart');
const checkoutBtn = document.getElementById('checkout-btn');

cartIcon.addEventListener('click', () => {
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
});

closeCart.addEventListener('click', () => {
    cartModal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
});

window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
        document.body.style.overflow = '';
    }
});

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!');
        return;
    }

    // Check if payment method is selected
    const selectedPayment = document.querySelector('input[name="payment-method"]:checked');
    if (!selectedPayment) {
        showNotification('Por favor, selecione uma forma de pagamento.');
        return;
    }

    const paymentMethod = selectedPayment.value;
    let paymentDetails = paymentMethod;

    if (paymentMethod === 'Crédito') {
        const creditoOptions = document.getElementById('credito-options');
        const selectedCreditType = document.querySelector('input[name="credito-type"]:checked');
        if (!selectedCreditType) {
            showNotification('Por favor, selecione se é à vista ou parcelado.');
            return;
        }
        if (selectedCreditType.value === 'Parcelado') {
            const installments = document.getElementById('installments').value;
            paymentDetails += ` - Parcelado em ${installments}x`;
        } else {
            paymentDetails += ' - À vista';
        }
    }

    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order object
    const order = {
        id: generateOrderId(),
        items: cart.map(item => `${item.quantity}x ${item.name}`).join(', '),
        total: total,
        payment: paymentDetails,
        status: 'Novo',
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now()
    };

    // Save order to localStorage
    saveOrder(order);

    // Success!
    showNotification(`Pedido #${order.id} confirmado com ${paymentDetails}! 🎉`);
    
    cart = [];
    updateCartDisplay();
    cartModal.style.display = 'none';
    document.body.style.overflow = '';
});

function generateOrderId() {
    // Generate a unique order ID based on timestamp
    const orders = getOrders();
    let newId = 1;
    if (orders.length > 0) {
        const maxId = Math.max(...orders.map(o => o.id));
        newId = maxId + 1;
    }
    return newId;
}

function getOrders() {
    const savedOrders = localStorage.getItem('pedidos');
    return savedOrders ? JSON.parse(savedOrders) : [];
}

function saveOrder(order) {
    const orders = getOrders();
    orders.push(order);
    localStorage.setItem('pedidos', JSON.stringify(orders));
    console.log('Order saved:', order);
}

function changeQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartDisplay();
}

// Generate Pix QR Code
function generatePixQRCode() {
    const qrcodeImage = document.getElementById('qrcode-image');
    if (!qrcodeImage) return;
    
    // Calculate total from cart
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Pix key and payment info
    const pixKey = 'cupcake@delicia.com';
    const establishmentName = 'CupCake Delícia';
    
    // Create payment info string for QR code
    // Using a simple text format that can be copied or scanned
    const paymentInfo = `CupCake Delícia\nChave Pix: ${pixKey}\nValor: R$ ${total.toFixed(2).replace('.', ',')}`;
    
    // Use QR Server API to generate QR code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentInfo)}`;
    
    qrcodeImage.src = qrCodeUrl;
    
    console.log('QR Code generated for Pix payment - Total: R$ ' + total.toFixed(2));
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

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Obrigado pela mensagem! Entraremos em contato em breve.');
        contactForm.reset();
    });
}

// Smooth Scrolling for Navigation Links
const navLinks = document.querySelectorAll('.nav-links a');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#') && href !== '#') {
            e.preventDefault();
            const targetSection = document.querySelector(href);
            const headerHeight = document.querySelector('header').offsetHeight;

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - headerHeight,
                    behavior: 'smooth'
                });
            }
        }
        // If href doesn't start with '#', let the browser handle navigation to other pages
    });
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
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
        const pixQrcode = document.getElementById('pix-qrcode');
        const cardForm = document.getElementById('card-form');
        
        if (creditoOptions) {
            if (e.target.value === 'Crédito') {
                creditoOptions.classList.add('show');
                // Pre-select parcelado by default
                const parceladoRadio = document.querySelector('input[name="credito-type"][value="Parcelado"]');
                if (parceladoRadio) {
                    parceladoRadio.checked = true;
                    const installmentsSelect = document.getElementById('installments');
                    if (installmentsSelect) {
                        installmentsSelect.disabled = false;
                        installmentsSelect.value = '2';
                    }
                }
            } else {
                creditoOptions.classList.remove('show');
                // Reset credit options
                document.querySelectorAll('input[name="credito-type"]').forEach(radio => radio.checked = false);
                const installmentsSelect = document.getElementById('installments');
                if (installmentsSelect) {
                    installmentsSelect.disabled = true;
                    installmentsSelect.value = '2';
                }
            }
        }
        
        // Handle Card Form display (for both Crédito and Débito)
        if (cardForm) {
            if (e.target.value === 'Crédito' || e.target.value === 'Débito') {
                cardForm.classList.add('show');
            } else {
                cardForm.classList.remove('show');
            }
        }
        
        // Handle Pix QR Code display
        if (pixQrcode) {
            if (e.target.value === 'Pix') {
                pixQrcode.classList.add('show');
                // Generate QR code with current total
                generatePixQRCode();
            } else {
                pixQrcode.classList.remove('show');
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
        installBtn.textContent = '📲 Instalar App';
        installBtn.className = 'btn install-btn';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1001;
            padding: 12px 20px;
            font-size: 0.9rem;
            border-radius: 30px;
            background: linear-gradient(45deg, #e91e63, #ff4081);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(233, 30, 99, 0.4);
            font-weight: 600;
            transition: all 0.3s ease;
        `;

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
                installBtn.remove();
            });
        });

        installBtn.addEventListener('mouseenter', () => {
            installBtn.style.transform = 'translateY(-3px)';
        });
        
        installBtn.addEventListener('mouseleave', () => {
            installBtn.style.transform = 'translateY(0)';
        });

        document.body.appendChild(installBtn);
    }
}

// Add scroll-based header styling
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 30px rgba(0,0,0,0.15)';
    } else {
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    }
});
