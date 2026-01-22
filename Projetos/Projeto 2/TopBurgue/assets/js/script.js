// Cart management
let cart = [];
let total = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const item = this.getAttribute('data-item');
            const price = parseFloat(this.getAttribute('data-price'));
            addToCart(item, price);
            playSound(); // Play sound on add
        });
    });

    // Order form submission
    document.getElementById('orderForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        submitOrder(name, phone, address);
        playSound(); // Play sound on submit
    });
});

function addToCart(item, price) {
    cart.push({ item, price });
    total += price;
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartList = document.getElementById('cart');
    cartList.innerHTML = '';
    cart.forEach((cartItem, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.textContent = `${cartItem.item} - R$ ${cartItem.price.toFixed(2)}`;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-danger btn-sm';
        removeBtn.textContent = 'Remover';
        removeBtn.addEventListener('click', () => removeFromCart(index));
        li.appendChild(removeBtn);
        cartList.appendChild(li);
    });
    document.getElementById('total').textContent = total.toFixed(2);
}

function removeFromCart(index) {
    total -= cart[index].price;
    cart.splice(index, 1);
    updateCartDisplay();
}

function submitOrder(name, phone, address) {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    const orderDetails = `Pedido de ${name}\nTelefone: ${phone}\nEndereço: ${address}\nItens:\n${cart.map(item => `${item.item} - R$ ${item.price.toFixed(2)}`).join('\n')}\nTotal: R$ ${total.toFixed(2)}`;
    alert('Pedido enviado!\n\n' + orderDetails);
    // In a real app, send to server
    cart = [];
    total = 0;
    updateCartDisplay();
    document.getElementById('orderForm').reset();
}

function playSound() {
    // Simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'square';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Financeiro page functionality
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        if (username === 'Marco' && password === '5252') {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            loadFinancialData();
            errorDiv.style.display = 'none';
        } else {
            errorDiv.textContent = 'Usuário ou senha incorretos!';
            errorDiv.style.display = 'block';
        }
    });
}

if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').style.display = 'none';
    });
}

function submitOrder(name, phone, address) {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    const order = {
        name,
        phone,
        address,
        items: cart,
        total,
        date: new Date().toLocaleString(),
        timestamp: new Date().getTime(),
        status: 'completed'
    };
    // Store order in localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    const orderDetails = `Pedido de ${name}\nTelefone: ${phone}\nEndereço: ${address}\nItens:\n${cart.map(item => `${item.item} - R$ ${item.price.toFixed(2)}`).join('\n')}\nTotal: R$ ${total.toFixed(2)}`;
    alert('Pedido enviado!\n\n' + orderDetails);
    // In a real app, send to server
    cart = [];
    total = 0;
    updateCartDisplay();
    document.getElementById('orderForm').reset();
}

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

    // Update metrics display
    document.getElementById('totalPedidos').textContent = totalPedidos;
    document.getElementById('faturamentoTotal').textContent = `R$ ${faturamentoTotal.toFixed(2)}`;
    document.getElementById('pedidosHoje').textContent = pedidosHoje;
    document.getElementById('faturamentoHoje').textContent = `R$ ${faturamentoHoje.toFixed(2)}`;

    // Load orders
    loadOrders();

    // Load recent activity
    loadRecentActivity();
}

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const pedidosContainer = document.getElementById('pedidosContainer');

    if (orders.length === 0) {
        pedidosContainer.innerHTML = '<p class="text-muted">Nenhum pedido recebido ainda.</p>';
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

function loadRecentActivity() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const atividadeRecente = document.getElementById('atividadeRecente');

    if (orders.length === 0) {
        atividadeRecente.innerHTML = '<p class="text-muted">Nenhuma atividade recente.</p>';
        return;
    }

    atividadeRecente.innerHTML = '';
    const recentOrders = orders.slice(-5).reverse(); // Last 5 orders

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

// Quick Actions Functions
function exportarRelatorio() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders.length === 0) {
        alert('Nenhum pedido para exportar.');
        return;
    }

    let report = 'RELATÓRIO FINANCEIRO - TOPBURGUE\n\n';
    report += `Data de geração: ${new Date().toLocaleString()}\n\n`;

    const totalPedidos = orders.length;
    const faturamentoTotal = orders.reduce((sum, order) => sum + order.total, 0);

    report += `TOTAL DE PEDIDOS: ${totalPedidos}\n`;
    report += `FATURAMENTO TOTAL: R$ ${faturamentoTotal.toFixed(2)}\n\n`;

    report += 'DETALHES DOS PEDIDOS:\n';
    report += '=' .repeat(50) + '\n';

    orders.forEach((order, index) => {
        report += `\nPedido ${index + 1}:\n`;
        report += `Cliente: ${order.name}\n`;
        report += `Data: ${order.date}\n`;
        report += `Telefone: ${order.phone}\n`;
        report += `Endereço: ${order.address}\n`;
        report += `Itens: ${order.items.map(item => `${item.item} - R$ ${item.price.toFixed(2)}`).join(', ')}\n`;
        report += `Total: R$ ${order.total.toFixed(2)}\n`;
        report += '-' .repeat(30) + '\n';
    });

    // Create and download file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Relatório exportado com sucesso!');
}

function limparHistorico() {
    if (confirm('Tem certeza que deseja limpar todo o histórico de pedidos? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('orders');
        loadFinancialData();
        alert('Histórico limpo com sucesso!');
    }
}

function atualizarDados() {
    loadFinancialData();
    alert('Dados atualizados!');
}
