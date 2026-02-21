// Admin Dashboard JavaScript

// Login Functionality
const loginForm = document.getElementById('login-form');
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');

// Demo credentials (in a real app, this would be handled server-side)
const VALID_USER = 'admin';
const VALID_PASS = 'Admin123';

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === VALID_USER && password === VALID_PASS) {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'flex';
        localStorage.setItem('loggedIn', 'true');
        // Load orders when logging in
        carregarPedidos();
    } else {
        alert('Usuário ou senha incorretos!');
    }
});

// Check if already logged in
if (localStorage.getItem('loggedIn') === 'true') {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'flex';
    // Load orders if already logged in
    setTimeout(carregarPedidos, 100);
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('loggedIn');
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
});

// Navigation
const navItems = document.querySelectorAll('.nav-item[data-section]');
const sections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('page-title');

const sectionTitles = {
    'pedidos': 'Pedidos',
    'financeiro': 'Financeiro',
    'estoque': 'Estoque',
    'relatorios': 'Relatórios'
};

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show corresponding section
        const sectionId = item.getAttribute('data-section');
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(`${sectionId}-section`).classList.add('active');
        
        // Update page title
        pageTitle.textContent = sectionTitles[sectionId];
        
        // Refresh orders when clicking on pedidos section
        if (sectionId === 'pedidos') {
            carregarPedidos();
        }
    });
});

// Current Date
const currentDateElement = document.getElementById('current-date');
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
currentDateElement.textContent = today.toLocaleDateString('pt-BR', options);

// ==================== ORDER MANAGEMENT FUNCTIONS ====================

// Load orders from localStorage
function carregarPedidos() {
    const pedidos = getPedidos();
    const tbody = document.getElementById('orders-table-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px;">Nenhum pedido encontrado 🧁</td></tr>';
        atualizarEstatisticasPedidos();
        return;
    }
    
    // Sort by timestamp (newest first)
    pedidos.sort((a, b) => b.timestamp - a.timestamp);
    
    pedidos.forEach((pedido, index) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-pedido-id', pedido.id);
        
        const statusClass = getStatusBadgeClass(pedido.status);
        const statusOptions = gerarOptionsStatus(pedido.status);
        
        tr.innerHTML = `
            <td>#${String(pedido.id).padStart(3, '0')}</td>
            <td>Cliente</td>
            <td>${pedido.items}</td>
            <td>R$ ${pedido.total.toFixed(2).replace('.', ',')}</td>
            <td>${pedido.payment}</td>
            <td><span class="status-badge ${statusClass}">${pedido.status}</span></td>
            <td>${pedido.date}</td>
            <td>
                <select class="status-select" onchange="alterarStatusPedido(${pedido.id}, this.value)">
                    ${statusOptions}
                </select>
                <button class="btn-action danger" onclick="excluirPedido(${pedido.id})" title="Excluir">🗑️</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    atualizarEstatisticasPedidos();
}

// Get all orders from localStorage
function getPedidos() {
    const saved = localStorage.getItem('pedidos');
    return saved ? JSON.parse(saved) : [];
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch(status) {
        case 'Novo': return 'novo';
        case 'Em Produção': return 'producao';
        case 'Pronto': return 'pronto';
        case 'Entregue': return 'entregue';
        case 'Cancelado': return 'cancelado';
        default: return 'novo';
    }
}

// Generate status options for select
function gerarOptionsStatus(statusAtual) {
    const statuses = ['Novo', 'Em Produção', 'Pronto', 'Entregue', 'Cancelado'];
    let options = '';
    statuses.forEach(status => {
        const selected = status === statusAtual ? 'selected' : '';
        options += `<option value="${status}" ${selected}>${status}</option>`;
    });
    return options;
}

// Change order status
function alterarStatusPedido(orderId, novoStatus) {
    const pedidos = getPedidos();
    const pedidoIndex = pedidos.findIndex(p => p.id === orderId);
    
    if (pedidoIndex !== -1) {
        pedidos[pedidoIndex].status = novoStatus;
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        
        showNotification(`Status do pedido #${String(orderId).padStart(3, '0')} alterado para "${novoStatus}"`);
        
        // Update the badge in table
        const row = document.querySelector(`tr[data-pedido-id="${orderId}"]`);
        if (row) {
            const badge = row.querySelector('.status-badge');
            badge.textContent = novoStatus;
            badge.className = `status-badge ${getStatusBadgeClass(novoStatus)}`;
        }
        
        atualizarEstatisticasPedidos();
    }
}

// Delete/clear order
function excluirPedido(orderId) {
    if (confirm(`Tem certeza que deseja excluir o pedido #${String(orderId).padStart(3, '0')}?`)) {
        let pedidos = getPedidos();
        pedidos = pedidos.filter(p => p.id !== orderId);
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        
        showNotification(`Pedido #${String(orderId).padStart(3, '0')} excluído!`);
        
        // Remove row from table
        const row = document.querySelector(`tr[data-pedido-id="${orderId}"]`);
        if (row) {
            row.remove();
        }
        
        atualizarEstatisticasPedidos();
        
        // If table is empty, show message
        const tbody = document.getElementById('orders-table-body');
        if (tbody && pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px;">Nenhum pedido encontrado 🧁</td></tr>';
        }
    }
}

// Clear all delivered/completed orders
function limparPedidosConcluidos() {
    if (confirm('Deseja limpar todos os pedidos já concluídos ou cancelados?')) {
        let pedidos = getPedidos();
        const originalLength = pedidos.length;
        
        pedidos = pedidos.filter(p => p.status !== 'Entregue' && p.status !== 'Cancelado');
        
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        
        showNotification(`${originalLength - pedidos.length} pedido(s) limpo(s)!`);
        carregarPedidos();
    }
}

// Update order statistics
function atualizarEstatisticasPedidos() {
    const pedidos = getPedidos();
    
    const novos = pedidos.filter(p => p.status === 'Novo').length;
    const emProducao = pedidos.filter(p => p.status === 'Em Produção').length;
    const entreguesHoje = pedidos.filter(p => p.status === 'Entregue' && p.date === new Date().toLocaleDateString('pt-BR')).length;
    
    const faturamentoDia = pedidos
        .filter(p => p.date === new Date().toLocaleDateString('pt-BR'))
        .reduce((sum, p) => sum + p.total, 0);
    
    const novosEl = document.getElementById('novos-pedidos');
    const producaoEl = document.getElementById('em-producao');
    const entreguesEl = document.getElementById('entregues-hoje');
    const faturamentoEl = document.getElementById('faturamento-dia');
    
    if (novosEl) novosEl.textContent = novos;
    if (producaoEl) producaoEl.textContent = emProducao;
    if (entreguesEl) entregasEl.textContent = entreguesHoje;
    if (faturamentoEl) faturamentoEl.textContent = `R$ ${faturamentoDia.toFixed(2).replace('.', ',')}`;
}

// Auto-refresh orders every 10 seconds
setInterval(() => {
    if (localStorage.getItem('loggedIn') === 'true') {
        carregarPedidos();
    }
}, 10000);

// Legacy functions for backward compatibility
function alterarStatus(orderId) {
    // Now handled by alterarStatusPedido
    carregarPedidos();
}

function cancelarPedido(orderId) {
    alterarStatusPedido(orderId, 'Cancelado');
}

// Product Management Functions
function adicionarProduto() {
    document.getElementById('add-product-modal').style.display = 'flex';
    document.getElementById('novo-produto-nome').focus();
}

function fecharModal() {
    document.getElementById('add-product-modal').style.display = 'none';
    document.getElementById('add-product-form').reset();
}

// Close modal when clicking outside
document.getElementById('add-product-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        fecharModal();
    }
});

function salvarNovoProduto(event) {
    event.preventDefault();
    
    const nome = document.getElementById('novo-produto-nome').value.trim();
    const categoria = document.getElementById('novo-produto-categoria').value;
    const quantidade = parseInt(document.getElementById('novo-produto-quantidade').value);
    const unidade = document.getElementById('novo-produto-unidade').value;
    const custo = parseFloat(document.getElementById('novo-produto-custo').value);
    
    if (!nome || !categoria || isNaN(quantidade) || !unidade || isNaN(custo)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }
    
    // Calculate status based on quantity
    const status = calcularStatus(quantidade);
    
    // Get next product ID
    const existingIds = Array.from(document.querySelectorAll('#estoque-table-body tr'))
        .map(row => parseInt(row.getAttribute('data-produto')));
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    
    // Create new table row
    const tbody = document.getElementById('estoque-table-body');
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-produto', newId);
    newRow.setAttribute('data-custo', custo.toFixed(2));
    
    newRow.innerHTML = `
        <td>${nome}</td>
        <td>${categoria}</td>
        <td>
            <div class="quantity-control">
                <button class="qty-btn" onclick="alterarQuantidade(${newId}, -1)">-</button>
                <input type="number" class="qty-input" id="qty-${newId}" value="${quantidade}" min="0" onchange="atualizarStatus(${newId})">
                <button class="qty-btn" onclick="alterarQuantidade(${newId}, 1)">+</button>
            </div>
        </td>
        <td>${unidade}</td>
        <td>R$ ${custo.toFixed(2).replace('.', ',')}</td>
        <td><span class="stock-badge" id="status-${newId}">${status}</span></td>
        <td>
            <button class="btn-action" onclick="salvarProduto(${newId})">💾</button>
        </td>
    `;
    
    tbody.appendChild(newRow);
    
    // Save to localStorage
    salvarProduto(newId);
    
    // Update statistics
    atualizarEstatisticasEstoque();
    
    // Show success notification
    showNotification(`Produto "${nome}" adicionado ao estoque com sucesso!`);
    
    // Close modal
    fecharModal();
    
    console.log(`Novo produto adicionado: ${nome} (ID: ${newId})`);
}

function editarProduto(productId) {
    alert(`Abrir formulário para editar produto #${productId}`);
    // In a real app, this would open a modal with product data
}

// Financial Functions
function verDetalhesTransacao(transactionId) {
    alert(`Mostrar detalhes da transação #${transactionId}`);
}

// Reports Functions
function exportarRelatorio() {
    alert('Exportando relatório em PDF...');
    // In a real app, this would generate and download a PDF
}

function gerarRelatorio() {
    alert('Selecione os parâmetros para gerar um novo relatório');
    // In a real app, this would open a form to select parameters
}

// Generate and download inventory report (CSV)
function gerarRelatorioEstoque() {
    // Get stock data from localStorage
    const savedStock = localStorage.getItem('estoque');
    let estoque = {};
    
    if (savedStock) {
        estoque = JSON.parse(savedStock);
    } else {
        // Get data from HTML table if localStorage is empty
        const rows = document.querySelectorAll('#estoque-table-body tr');
        rows.forEach(row => {
            const produtoId = row.getAttribute('data-produto');
            const quantidade = parseInt(document.getElementById(`qty-${produtoId}`).value);
            const custo = parseFloat(row.getAttribute('data-custo'));
            const produto = row.cells[0].textContent;
            const categoria = row.cells[1].textContent;
            const unidade = row.cells[3].textContent;
            const status = document.getElementById(`status-${produtoId}`).textContent;
            
            estoque[produtoId] = {
                produto,
                categoria,
                quantidade,
                unidade,
                custo,
                status
            };
        });
    }
    
    // Check if there's data
    const productCount = Object.keys(estoque).length;
    if (productCount === 0) {
        alert('Não há produtos no estoque para exportar!');
        return;
    }
    
    // Create CSV content
    let csvContent = '\uFEFF'; // BOM for UTF-8
    csvContent += 'Produto;Categoria;Quantidade;Unidade;Custo Unitário;Status;Valor Total\n';
    
    let totalValue = 0;
    let lowStockCount = 0;
    
    for (const data of Object.values(estoque)) {
        const rowTotal = data.quantidade * data.custo;
        totalValue += rowTotal;
        
        if (data.status === 'Baixo') {
            lowStockCount++;
        }
        
        csvContent += `${data.produto};${data.categoria};${data.quantidade};${data.unidade};R$ ${data.custo.toFixed(2).replace('.', ',')};${data.status};R$ ${rowTotal.toFixed(2).replace('.', ',')}\n`;
    }
    
    // Add summary row
    csvContent += `\n;TOTAL;${Object.values(estoque).reduce((sum, p) => sum + p.quantidade, 0)};;R$ ${(Object.values(estoque).reduce((sum, p) => sum + p.quantidade * p.custo, 0)).toFixed(2).replace('.', ',')};;\n`;
    csvContent += `;Produtos com estoque baixo: ${lowStockCount};;;;;\n`;
    csvContent += `;Data do relatório: ${new Date().toLocaleDateString('pt-BR')};;;;;\n`;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Generate filename with date
    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const filename = `relatorio_estoque_${date}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`Relatório de estoque baixado: ${filename}`);
    
    console.log('Relatório de estoque exportado com sucesso!');
}

// Filter Functionality
document.getElementById('status-filter').addEventListener('change', (e) => {
    console.log('Filtrando pedidos por:', e.target.value);
    // In a real app, this would filter the table
});

document.getElementById('date-filter').addEventListener('change', (e) => {
    console.log('Filtrando por data:', e.target.value);
    // In a real app, this would filter the table
});

document.getElementById('estoque-filter').addEventListener('change', (e) => {
    console.log('Filtrando estoque por:', e.target.value);
    // In a real app, this would filter the table
});

// Period Selector for Reports
const periodBtns = document.querySelectorAll('.period-btn');
periodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        periodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // In a real app, this would update the chart data
    });
});

// Simulated Data Update (for demo purposes)
function atualizarDados() {
    // Update stats
    document.getElementById('novos-pedidos').textContent = Math.floor(Math.random() * 10);
    document.getElementById('em-producao').textContent = Math.floor(Math.random() * 8);
    document.getElementById('entregues-hoje').textContent = Math.floor(Math.random() * 15);
}

// Stock Management Functions

// Stock thresholds for status calculation
const STOCK_THRESHOLDS = {
    baixo: 5,    // Below 5 = Low stock
    medio: 15    // 5-15 = Medium stock, above 15 = High stock
};

// Initialize stock data from localStorage or use defaults
function inicializarEstoque() {
    const savedStock = localStorage.getItem('estoque');
    if (savedStock) {
        const estoque = JSON.parse(savedStock);
        // Update quantity inputs with saved values
        for (const [id, data] of Object.entries(estoque)) {
            const qtyInput = document.getElementById(`qty-${id}`);
            const statusBadge = document.getElementById(`status-${id}`);
            if (qtyInput) {
                qtyInput.value = data.quantidade;
            }
            if (statusBadge) {
                statusBadge.textContent = data.status;
                statusBadge.className = `stock-badge ${getStatusClass(data.status)}`;
            }
        }
        atualizarEstatisticasEstoque();
    } else {
        // Initialize with default values from HTML
        salvarTodoEstoque();
    }
}

// Save all stock data to localStorage
function salvarTodoEstoque() {
    const estoque = {};
    const rows = document.querySelectorAll('#estoque-table-body tr');
    rows.forEach(row => {
        const produtoId = row.getAttribute('data-produto');
        const quantidade = parseInt(document.getElementById(`qty-${produtoId}`).value);
        const custo = parseFloat(row.getAttribute('data-custo'));
        const produto = row.cells[0].textContent;
        const categoria = row.cells[1].textContent;
        const unidade = row.cells[3].textContent;
        const status = document.getElementById(`status-${produtoId}`).textContent;
        
        estoque[produtoId] = {
            produto,
            categoria,
            quantidade,
            unidade,
            custo,
            status
        };
    });
    localStorage.setItem('estoque', JSON.stringify(estoque));
    atualizarEstatisticasEstoque();
}

// Get status class based on status text
function getStatusClass(status) {
    switch(status) {
        case 'Baixo': return 'low';
        case 'Médio': return 'medium';
        case 'Alto': return 'high';
        default: return '';
    }
}

// Calculate status based on quantity
function calcularStatus(quantidade) {
    if (quantidade <= STOCK_THRESHOLDS.baixo) {
        return 'Baixo';
    } else if (quantidade <= STOCK_THRESHOLDS.medio) {
        return 'Médio';
    } else {
        return 'Alto';
    }
}

// Alter quantity of a product
function alterarQuantidade(id, change) {
    const input = document.getElementById(`qty-${id}`);
    let novaQuantidade = parseInt(input.value) + change;
    
    if (novaQuantidade < 0) {
        novaQuantidade = 0;
    }
    
    input.value = novaQuantidade;
    
    // Auto-save after quantity change
    atualizarStatus(id);
    salvarProduto(id);
    
    // Show feedback
    showNotification(`Quantidade atualizada: ${novaQuantidade}`);
}

// Update stock status based on quantity
function atualizarStatus(id) {
    const input = document.getElementById(`qty-${id}`);
    const statusBadge = document.getElementById(`status-${id}`);
    const quantidade = parseInt(input.value);
    
    const novoStatus = calcularStatus(quantidade);
    statusBadge.textContent = novoStatus;
    statusBadge.className = `stock-badge ${getStatusClass(novoStatus)}`;
}

// Save a single product to localStorage
function salvarProduto(id) {
    const row = document.querySelector(`tr[data-produto="${id}"]`);
    const quantidade = parseInt(document.getElementById(`qty-${id}`).value);
    const custo = parseFloat(row.getAttribute('data-custo'));
    const produto = row.cells[0].textContent;
    const categoria = row.cells[1].textContent;
    const unidade = row.cells[3].textContent;
    const status = document.getElementById(`status-${id}`).textContent;
    
    // Get existing stock data
    let estoque = {};
    const savedStock = localStorage.getItem('estoque');
    if (savedStock) {
        estoque = JSON.parse(savedStock);
    }
    
    // Update the product
    estoque[id] = {
        produto,
        categoria,
        quantidade,
        unidade,
        custo,
        status
    };
    
    // Save to localStorage
    localStorage.setItem('estoque', JSON.stringify(estoque));
    
    // Update statistics
    atualizarEstatisticasEstoque();
    
    console.log(`Produto ${produto} salvo com sucesso!`);
}

// Update stock statistics
function atualizarEstatisticasEstoque() {
    const savedStock = localStorage.getItem('estoque');
    if (!savedStock) return;
    
    const estoque = JSON.parse(savedStock);
    let totalItens = 0;
    let estoqueBaixo = 0;
    let estoqueOk = 0;
    let valorTotal = 0;
    
    for (const data of Object.values(estoque)) {
        totalItens += data.quantidade;
        valorTotal += data.quantidade * data.custo;
        
        if (data.status === 'Baixo') {
            estoqueBaixo++;
        } else {
            estoqueOk++;
        }
    }
    
    // Update the statistics display
    const totalProdutosEl = document.getElementById('total-produtos');
    const estoqueBaixoEl = document.getElementById('estoque-baixo');
    const estoqueOkEl = document.getElementById('estoque-ok');
    const valorEstoqueEl = document.getElementById('valor-estoque');
    
    if (totalProdutosEl) totalProdutosEl.textContent = totalItens;
    if (estoqueBaixoEl) estoqueBaixoEl.textContent = estoqueBaixo;
    if (estoqueOkEl) estoqueOkEl.textContent = estoqueOk;
    if (valorEstoqueEl) valorEstoqueEl.textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
}

// Show notification
function showNotification(message) {
    // Remove existing notifications
    const existing = document.querySelector('.stock-notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'stock-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #4caf50, #8bc34a);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(76, 175, 80, 0.4);
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
const stockStyle = document.createElement('style');
stockStyle.textContent = `
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
    .stock-badge {
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.85rem;
        font-weight: 600;
    }
    .stock-badge.low {
        background: #ffebee;
        color: #c62828;
    }
    .stock-badge.medium {
        background: #fff3e0;
        color: #ef6c00;
    }
    .stock-badge.high {
        background: #e8f5e9;
        color: #2e7d32;
    }
`;
document.head.appendChild(stockStyle);

// Initialize with some demo data
console.log('Admin Dashboard loaded successfully!');

// Initialize stock when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the admin page with stock management
    if (document.getElementById('estoque-table-body')) {
        inicializarEstoque();
    }
});

// Mobile Menu Functions
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar) sidebar.classList.toggle('active');
    if (menuBtn) menuBtn.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('mobile-menu-btn');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar) sidebar.classList.remove('active');
    if (menuBtn) menuBtn.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}
