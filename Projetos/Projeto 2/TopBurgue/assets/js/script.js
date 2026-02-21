/**
 * TopBurgue - JavaScript
 * Enhanced functionality with animations and better UX
 */

// ========================================
// Cart Management
// ========================================
let cart = [];
let total = 0;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Cart functionality (only on pages with cart)
    initCart();
    
    // Contact form validation
    initContactForm();
    
    // Navbar scroll effect
    initNavbar();
    
    // Smooth scroll for anchor links
    initSmoothScroll();
});

/**
 * Initialize cart functionality
 */
function initCart() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const item = this.getAttribute('data-item');
                const price = parseFloat(this.getAttribute('data-price'));
                addToCart(item, price);
                
                // Visual feedback
                showToast(`"${item}" adicionado ao carrinho!`, 'success');
                playSound('add');
                
                // Button animation
                this.classList.add('added');
                setTimeout(() => this.classList.remove('added'), 1000);
            });
        });
    }

    // Order form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            
            if (validateOrderForm(name, phone, address)) {
                submitOrder(name, phone, address);
            }
        });
    }
}

/**
 * Add item to cart
 */
function addToCart(item, price) {
    cart.push({ item, price });
    total += price;
    updateCartDisplay();
}

/**
 * Update cart display
 */
function updateCartDisplay() {
    const cartList = document.getElementById('cart');
    if (!cartList) return;
    
    cartList.innerHTML = '';
    
    if (cart.length === 0) {
        cartList.innerHTML = `
            <li class="list-group-item text-muted text-center py-4">
                <i class="fas fa-shopping-basket fa-2x mb-2 d-block"></i>
                Seu carrinho está vazio
            </li>
        `;
    } else {
        cart.forEach((cartItem, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span>${cartItem.item}</span>
                <div class="d-flex align-items-center gap-2">
                    <span class="fw-bold">R$ ${cartItem.price.toFixed(2)}</span>
                    <button class="btn btn-danger btn-sm remove-btn" onclick="removeFromCart(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            cartList.appendChild(li);
        });
    }
    
    // Update total
    const totalElement = document.getElementById('total');
    if (totalElement) {
        totalElement.textContent = `R$ ${total.toFixed(2)}`;
    }
}

/**
 * Remove item from cart
 */
function removeFromCart(index) {
    total -= cart[index].price;
    cart.splice(index, 1);
    updateCartDisplay();
    showToast('Item removido do carrinho', 'info');
}

/**
 * Validate order form
 */
function validateOrderForm(name, phone, address) {
    if (cart.length === 0) {
        showToast('Seu carrinho está vazio!', 'error');
        return false;
    }
    
    if (!name || name.trim().length < 3) {
        showToast('Por favor, insira seu nome completo!', 'error');
        document.getElementById('name').focus();
        return false;
    }
    
    if (!phone || phone.trim().length < 10) {
        showToast('Por favor, insira um telefone válido!', 'error');
        document.getElementById('phone').focus();
        return false;
    }
    
    if (!address || address.trim().length < 10) {
        showToast('Por favor, insira um endereço completo!', 'error');
        document.getElementById('address').focus();
        return false;
    }
    
    return true;
}

/**
 * Submit order
 */
function submitOrder(name, phone, address) {
    const order = {
        name,
        phone,
        address,
        items: [...cart],
        total,
        date: new Date().toLocaleString('pt-BR'),
        timestamp: new Date().getTime(),
        status: 'completed'
    };
    
    // Store order in localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Format order details
    const orderDetails = `📋 PEDIDO - TOPBURGUE\n\n`;
    const orderDetails2 = `Cliente: ${name}\n`;
    const orderDetails3 = `Telefone: ${phone}\n`;
    const orderDetails4 = `Endereço: ${address}\n\n`;
    const orderDetails5 = `Itens:\n${cart.map(item => `• ${item.item} - R$ ${item.price.toFixed(2)}`).join('\n')}\n\n`;
    const orderDetails6 = `💰 TOTAL: R$ ${total.toFixed(2)}`;
    
    const fullDetails = orderDetails + orderDetails2 + orderDetails3 + orderDetails4 + orderDetails5 + orderDetails6;
    
    // Show success message
    alert('✅ Pedido enviado com sucesso!\n\n' + fullDetails);
    
    // Reset cart
    cart = [];
    total = 0;
    updateCartDisplay();
    document.getElementById('orderForm').reset();
    
    // Play success sound
    playSound('success');
    
    showToast('Pedido realizado com sucesso!', 'success');
}

// ========================================
// Contact Form
// ========================================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            if (validateContactForm(name, email, subject, message)) {
                // Simulate form submission
                showToast('Mensagem enviada com sucesso!', 'success');
                playSound('success');
                contactForm.reset();
            }
        });
    }
}

/**
 * Validate contact form
 */
function validateContactForm(name, email, subject, message) {
    if (!name || name.trim().length < 3) {
        showToast('Por favor, insira seu nome completo!', 'error');
        document.getElementById('name').focus();
        return false;
    }
    
    if (!email || !isValidEmail(email)) {
        showToast('Por favor, insira um email válido!', 'error');
        document.getElementById('email').focus();
        return false;
    }
    
    if (!subject) {
        showToast('Por favor, selecione um assunto!', 'error');
        document.getElementById('subject').focus();
        return false;
    }
    
    if (!message || message.trim().length < 10) {
        showToast('Por favor, insira uma mensagem com pelo menos 10 caracteres!', 'error');
        document.getElementById('message').focus();
        return false;
    }
    
    return true;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========================================
// Financial Page
// ========================================

// Login functionality
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        if (username === 'Marco' && password === '5252') {
            // Login successful
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('loginFooter').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            loadFinancialData();
            errorDiv.classList.remove('show');
            
            // Show welcome message
            setTimeout(() => {
                showToast('Bem-vindo ao painel financeiro!', 'success');
            }, 500);
        } else {
            // Login failed
            errorDiv.classList.add('show');
            playSound('error');
            
            // Shake animation
            const card = document.querySelector('.login-card');
            card.classList.add('shake');
            setTimeout(() => card.classList.remove('shake'), 500);
        }
    });
}

// Logout functionality
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginFooter').style.display = 'block';
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').classList.remove('show');
        
        showToast('Logout realizado com sucesso!', 'info');
    });
}

/**
 * Load financial data
 */
function loadFinancialData() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate metrics
    const totalPedidos = orders.length;
    const faturamentoTotal = orders.reduce((sum, order) => sum + order.total, 0);

    const pedidosHoje = orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate >= today;
    }).length;

    const faturamentoHoje = orders
        .filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate >= today;
        })
        .reduce((sum, order) => sum + order.total, 0);

    // Update metrics display with animation
    animateValue('totalPedidos', 0, totalPedidos, 1000);
    animateValue('faturamentoTotal', 0, faturamentoTotal, 1000, 'R$ ');
    animateValue('pedidosHoje', 0, pedidosHoje, 1000);
    animateValue('faturamentoHoje', 0, faturamentoHoje, 1000, 'R$ ');

    // Load orders
    loadOrders();

    // Load recent activity
    loadRecentActivity();
}

/**
 * Animate number values
 */
function animateValue(id, start, end, duration, prefix = '') {
    const element = document.getElementById(id);
    if (!element) return;
    
    const isCurrency = prefix === 'R$ ';
    const startTimestamp = performance.now();
    const range = end - start;
    
    const step = (timestamp) => {
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * range + start);
        
        if (isCurrency) {
            element.textContent = `${prefix}${value.toFixed(2)}`;
        } else {
            element.textContent = value;
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    
    window.requestAnimationFrame(step);
}

/**
 * Load orders
 */
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const pedidosContainer = document.getElementById('pedidosContainer');

    if (!pedidosContainer) return;

    if (orders.length === 0) {
        pedidosContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p class="text-muted">Nenhum pedido recebido ainda.</p>
            </div>
        `;
        return;
    }

    pedidosContainer.innerHTML = '';
    orders.slice().reverse().forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';

        const statusClass = order.status === 'completed' ? 'status-completed' : 'status-pending';
        const statusText = order.status === 'completed' ? 'Concluído' : 'Pendente';

        orderDiv.innerHTML = `
            <div class="order-header">
                <span class="order-customer">${order.name}</span>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="order-date">${order.date}</div>
            <div class="order-details">
                <strong>Telefone:</strong> ${order.phone}<br>
                <strong>Endereço:</strong> ${order.address}<br>
                <strong>Itens:</strong> ${order.items.map(item => `${item.item} (R$ ${item.price.toFixed(2)})`).join(', ')}
            </div>
            <div class="order-total">Total: R$ ${order.total.toFixed(2)}</div>
        `;
        pedidosContainer.appendChild(orderDiv);
    });
}

/**
 * Load recent activity
 */
function loadRecentActivity() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const atividadeRecente = document.getElementById('atividadeRecente');

    if (!atividadeRecente) return;

    if (orders.length === 0) {
        atividadeRecente.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash fa-2x mb-2"></i>
                <p class="text-muted small">Nenhuma atividade recente.</p>
            </div>
        `;
        return;
    }

    atividadeRecente.innerHTML = '';
    const recentOrders = orders.slice(-5).reverse();

    recentOrders.forEach(order => {
        const activityDiv = document.createElement('div');
        activityDiv.className = 'activity-item';
        activityDiv.innerHTML = `
            <div class="activity-text">
                <strong>${order.name}</strong> fez um pedido de R$ ${order.total.toFixed(2)}
            </div>
            <div class="activity-time">${order.date}</div>
        `;
        atividadeRecente.appendChild(activityDiv);
    });
}

// ========================================
// Quick Actions
// ========================================

/**
 * Export financial report
 */
function exportarRelatorio() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    if (orders.length === 0) {
        showToast('Nenhum pedido para exportar.', 'error');
        return;
    }

    let report = '═══════════════════════════════════════\n';
    report += '     RELATÓRIO FINANCEIRO - TOPBURGUE\n';
    report += '═══════════════════════════════════════\n\n';
    report += `Data de geração: ${new Date().toLocaleString('pt-BR')}\n\n`;

    const totalPedidos = orders.length;
    const faturamentoTotal = orders.reduce((sum, order) => sum + order.total, 0);

    report += '───────────────────────────────────────\n';
    report += '           RESUMO GERAL\n';
    report += '───────────────────────────────────────\n';
    report += `TOTAL DE PEDIDOS: ${totalPedidos}\n`;
    report += `FATURAMENTO TOTAL: R$ ${faturamentoTotal.toFixed(2)}\n\n`;

    report += '───────────────────────────────────────\n';
    report += '         DETALHES DOS PEDIDOS\n';
    report += '───────────────────────────────────────\n\n';

    orders.forEach((order, index) => {
        report += `Pedido #${index + 1}\n`;
        report += `─────────────────────────────────────\n`;
        report += `Cliente: ${order.name}\n`;
        report += `Data: ${order.date}\n`;
        report += `Telefone: ${order.phone}\n`;
        report += `Endereço: ${order.address}\n`;
        report += `Itens: ${order.items.map(item => `${item.item} - R$ ${item.price.toFixed(2)}`).join(', ')}\n`;
        report += `Total: R$ ${order.total.toFixed(2)}\n\n`;
    });

    // Create and download file
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Relatório exportado com sucesso!', 'success');
    playSound('success');
}

/**
 * Clear history
 */
function limparHistorico() {
    if (confirm('⚠️ Tem certeza que deseja limpar todo o histórico de pedidos?\n\nEsta ação não pode ser desfeita!')) {
        localStorage.removeItem('orders');
        loadFinancialData();
        showToast('Histórico limpo com sucesso!', 'success');
    }
}

/**
 * Refresh data
 */
function atualizarDados() {
    loadFinancialData();
    showToast('Dados atualizados!', 'success');
}

// ========================================
// UI Utilities
// ========================================

/**
 * Initialize navbar scroll effect
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

/**
 * Initialize smooth scroll
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Play sound effect
 */
function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'add':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'success':
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'error':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
        }
    } catch (e) {
        // Audio not supported or blocked
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast-container');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast container
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle text-success"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle text-danger"></i>';
            break;
        case 'info':
            icon = '<i class="fas fa-info-circle text-info"></i>';
            break;
    }
    
    toast.innerHTML = `${icon}<span>${message}</span>`;
    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);
    
    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toastContainer.remove(), 300);
    }, 3000);
}

// ========================================
// Add CSS animations dynamically
// ========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(30px);
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    .added {
        animation: pulse 0.5s ease-in-out;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
    }
    
    .toast {
        background: white;
        border-radius: 12px;
        padding: 1rem 1.5rem;
        margin-bottom: 0.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        animation: slideInRight 0.3s ease-out;
    }
    
    .toast-success {
        border-left: 4px solid #10b981;
    }
    
    .toast-error {
        border-left: 4px solid #ef4444;
    }
    
    .toast-info {
        border-left: 4px solid #3b82f6;
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);
