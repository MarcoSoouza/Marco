// Admin authentication
const ADMIN_CREDENTIALS = {
    username: 'finance',
    password: 'admin123'
};

// Global variables for data
let inventory = [];
let sales = [];

// Load data from server
async function loadData() {
    try {
        const [inventoryResponse, salesResponse] = await Promise.all([
            fetch('/api/inventory'),
            fetch('/api/sales')
        ]);

        if (inventoryResponse.ok) {
            inventory = await inventoryResponse.json();
        } else {
            console.error('Failed to load inventory');
            inventory = [
                { id: 1, name: 'Smart TV 55” TCL 55C6K 4K', stock: 5, price: 3900.00, cost: 3900.00, salesToday: 0, image: 'Imagem/Smart TV 55” TCL 55C6K 4K QD-Mini Led 144Hz Sistema Operacional Google TV.jpeg' },
                { id: 2, name: 'Apple iPhone 16 (128 GB) – Preto', stock: 10, price: 5000.00, cost: 4000.00, salesToday: 0, image: 'Imagem/Apple-iPhone-17-Pro-color-lineup_.webp' },
                { id: 3, name: 'Controle Sony DualSense PS5, Sem Fio, Branco', stock: 15, price: 350.00, cost: 250.00, salesToday: 0, image: 'Imagem/Controle Sony DualSense PS5, Sem Fio, Branco.webp' },
                { id: 4, name: 'PlayStation 5 Edição Digital 825GB', stock: 10, price: 4500.00, cost: 4000.00, salesToday: 0, image: 'PS5.jfif' }
            ];
        }

        if (salesResponse.ok) {
            sales = await salesResponse.json();
        } else {
            console.error('Failed to load sales');
            sales = [];
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to default data
        inventory = [
            { id: 1, name: 'Smart TV 55” TCL 55C6K 4K', stock: 5, price: 3900.00, cost: 3900.00, salesToday: 0, image: 'Imagem/Smart TV 55” TCL 55C6K 4K QD-Mini Led 144Hz Sistema Operacional Google TV.jpeg' },
            { id: 2, name: 'Apple iPhone 16 (128 GB) – Preto', stock: 10, price: 5000.00, cost: 4000.00, salesToday: 0, image: 'Imagem/Apple-iPhone-17-Pro-color-lineup_.webp' },
            { id: 3, name: 'Controle Sony DualSense PS5, Sem Fio, Branco', stock: 15, price: 350.00, cost: 250.00, salesToday: 0, image: 'Imagem/Controle Sony DualSense PS5, Sem Fio, Branco.webp' },
            { id: 4, name: 'PlayStation 5 Edição Digital 825GB', stock: 10, price: 4500.00, cost: 4000.00, salesToday: 0, image: 'PS5.jfif' }
        ];
        sales = [];
    }
}

// Save data to server
async function saveData() {
    try {
        await Promise.all([
            fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inventory)
            }),
            fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sales)
            })
        ]);
        console.log('Data saved successfully');
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Login functionality
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        initializeDashboard();
    } else {
        errorDiv.textContent = 'Usuário ou senha incorretos.';
    }
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', function() {
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-error').textContent = '';
});

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));

        this.classList.add('active');
        const sectionId = this.dataset.section + '-section';
        document.getElementById(sectionId).classList.add('active');
    });
});

// Initialize dashboard
function initializeDashboard() {
    updateInventoryTable();
    updateSalesSummary();
    updateSalesTable();
    updatePendingOrders();
    updateContactMessages();
    initializeCharts();
}

// Update pending orders display
function updatePendingOrders() {
    const pendingOrdersList = document.getElementById('pending-orders-list');
    const pendingSales = sales.filter(sale => sale.status === 'pending');

    if (pendingSales.length === 0) {
        pendingOrdersList.innerHTML = '<p>Nenhum pedido pendente de entrega.</p>';
        return;
    }

    pendingOrdersList.innerHTML = '';

    pendingSales.forEach(sale => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'pending-order-card';

        const orderDate = new Date(sale.date);
        const now = new Date();
        const waitingTime = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24)); // days

        // Calculate delivery deadline (assuming 7 days from order)
        const deliveryDeadline = new Date(orderDate);
        deliveryDeadline.setDate(orderDate.getDate() + 7);

        const daysUntilDeadline = Math.ceil((deliveryDeadline - now) / (1000 * 60 * 60 * 24));

        let statusClass = 'on-time';
        let statusText = 'No prazo';

        if (daysUntilDeadline < 0) {
            statusClass = 'overdue';
            statusText = 'Atrasado';
        } else if (daysUntilDeadline <= 2) {
            statusClass = 'urgent';
            statusText = 'Urgente';
        }

        orderDiv.innerHTML = `
            <div class="order-header">
                <h4>Pedido #${sale.id || 'N/A'}</h4>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            <div class="order-details">
                <p><strong>Data do Pedido:</strong> ${orderDate.toLocaleDateString('pt-BR')}</p>
                <p><strong>Tempo de Espera:</strong> ${waitingTime} dia(s)</p>
                <p><strong>Prazo de Entrega:</strong> ${deliveryDeadline.toLocaleDateString('pt-BR')} (${daysUntilDeadline > 0 ? daysUntilDeadline + ' dia(s)' : 'Atrasado'})</p>
                <p><strong>Valor Total:</strong> R$ ${sale.totalAmount ? sale.totalAmount.toFixed(2).replace('.', ',') : sale.amount.toFixed(2).replace('.', ',')}</p>
                <p><strong>Método de Pagamento:</strong> ${sale.paymentMethod}</p>
                <div class="order-items">
                    <strong>Itens:</strong>
                    <ul>
                        ${sale.items ? sale.items.map(item => `<li>${item.product} - ${item.quantity}x - R$ ${item.amount.toFixed(2).replace('.', ',')}</li>`).join('') : `<li>${sale.product} - ${sale.quantity}x - R$ ${sale.amount.toFixed(2).replace('.', ',')}</li>`}
                    </ul>
                </div>
            </div>
            <div class="order-actions">
                <button class="mark-delivered-btn" onclick="markAsDelivered('${sale.id || sale.date}')">Marcar como Entregue</button>
            </div>
        `;

        pendingOrdersList.appendChild(orderDiv);
    });
}

// Mark order as delivered
function markAsDelivered(orderId) {
    const saleIndex = sales.findIndex(sale => (sale.id && sale.id.toString() === orderId) || sale.date === orderId);
    if (saleIndex !== -1) {
        sales[saleIndex].status = 'delivered';
        saveData();
        updatePendingOrders();
        updateSalesSummary();
        alert('Pedido marcado como entregue!');
    }
}

// Inventory management
function updateInventoryTable() {
    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = '';

    inventory.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td><img src="${item.image || 'https://picsum.photos/50/50?random=' + item.id}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; cursor: pointer;" onclick="editImage(${item.id})" title="Clique para alterar a imagem"></td>
            <td>${item.name}</td>
            <td>${item.stock}</td>
            <td>R$ ${item.price.toFixed(2).replace('.', ',')}</td>
            <td>${item.salesToday}</td>
            <td>
                <button class="edit-btn" onclick="editProduct(${item.id})">Editar</button>
                <button class="delete-btn" onclick="deleteProduct(${item.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editProduct(id) {
    const product = inventory.find(p => p.id === id);
    if (product) {
        // For simplicity, using prompt. In a real app, you'd use a modal
        const newStock = prompt(`Novo estoque para ${product.name}:`, product.stock);
        if (newStock !== null) {
            product.stock = parseInt(newStock);
            updateInventoryTable();
            saveData();
        }
    }
}

function deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        inventory = inventory.filter(p => p.id !== id);
        updateInventoryTable();
        saveData();
    }
}

function editImage(id) {
    const product = inventory.find(p => p.id === id);
    if (product) {
        const newImage = prompt(`Nova URL da imagem para ${product.name}:`, product.image);
        if (newImage !== null && newImage.trim() !== '') {
            product.image = newImage.trim();
            updateInventoryTable();
            saveData();
        }
    }
}

// Add product functionality
document.getElementById('add-product-btn').addEventListener('click', function() {
    document.getElementById('add-product-modal').style.display = 'block';
});

document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('add-product-modal').style.display = 'none';
});

document.getElementById('add-product-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const cost = parseFloat(document.getElementById('product-cost').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const editId = this.dataset.editId;

    if (editId) {
        // Editing existing product
        const productIndex = inventory.findIndex(p => p.id === parseInt(editId));
        if (productIndex !== -1) {
            inventory[productIndex] = {
                ...inventory[productIndex],
                name: name,
                price: price,
                cost: cost,
                stock: stock
            };
        }
    } else {
        // Adding new product
        const newProduct = {
            id: inventory.length + 1,
            name: name,
            stock: stock,
            price: price,
            cost: cost,
            salesToday: 0
        };
        inventory.push(newProduct);
    }

    updateInventoryTable();
    saveData();

    // Reset form and close modal
    this.reset();
    document.querySelector('#add-product-modal h2').textContent = 'Adicionar Novo Produto';
    document.querySelector('#add-product-form button').textContent = 'Adicionar Produto';
    delete this.dataset.editId;
    document.getElementById('add-product-modal').style.display = 'none';
});

// Sales summary
function updateSalesSummary() {
    const today = new Date().toISOString().split('T')[0];

    const todaySales = sales
        .filter(s => s.date.startsWith(today))
        .reduce((sum, s) => {
            if (s.totalAmount) {
                return sum + s.totalAmount;
            } else {
                return sum + s.amount;
            }
        }, 0);

    const totalRevenue = sales.reduce((sum, s) => {
        if (s.totalAmount) {
            return sum + s.totalAmount;
        } else {
            return sum + s.amount;
        }
    }, 0);

    // Calculate today's profit
    const todayProfit = sales
        .filter(s => s.date.startsWith(today))
        .reduce((sum, s) => {
            if (s.totalAmount) {
                // New format: calculate profit based on items
                return sum + s.items.reduce((itemSum, item) => {
                    const product = inventory.find(p => p.name === item.product);
                    const cost = product ? product.cost : 0;
                    return itemSum + (item.amount - (cost * item.quantity));
                }, 0);
            } else {
                // Old format: approximate profit (assuming single product)
                const product = inventory.find(p => p.name === s.product);
                const cost = product ? product.cost : 0;
                return sum + (s.amount - (cost * s.quantity));
            }
        }, 0);

    // Calculate total profit
    const totalProfit = sales.reduce((sum, s) => {
        if (s.totalAmount) {
            // New format: calculate profit based on items
            return sum + s.items.reduce((itemSum, item) => {
                const product = inventory.find(p => p.name === item.product);
                const cost = product ? product.cost : 0;
                return itemSum + (item.amount - (cost * item.quantity));
            }, 0);
        } else {
            // Old format: approximate profit (assuming single product)
            const product = inventory.find(p => p.name === s.product);
            const cost = product ? product.cost : 0;
            return sum + (s.amount - (cost * s.quantity));
        }
    }, 0);

    const pendingOrdersCount = sales.filter(sale => sale.status === 'pending').length;

    document.getElementById('today-sales').textContent = `R$ ${todaySales.toFixed(2).replace('.', ',')}`;
    document.getElementById('total-revenue').textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
    document.getElementById('today-profit').textContent = `R$ ${todayProfit.toFixed(2).replace('.', ',')}`;
    document.getElementById('total-profit').textContent = `R$ ${totalProfit.toFixed(2).replace('.', ',')}`;
    document.getElementById('pending-orders').textContent = pendingOrdersCount;
}

// Sales table
function updateSalesTable() {
    const tbody = document.getElementById('sales-body');
    tbody.innerHTML = '';

    // Collect all sale items from the last 10 sales
    const recentItems = [];
    sales.slice(-10).reverse().forEach(sale => {
        if (sale.items) {
            // New format: multiple items per sale
            sale.items.forEach(item => {
                recentItems.push({
                    date: sale.date,
                    product: item.product,
                    quantity: item.quantity,
                    amount: item.amount,
                    paymentMethod: sale.paymentMethod
                });
            });
        } else {
            // Old format: single item per sale
            recentItems.push({
                date: sale.date,
                product: sale.product,
                quantity: sale.quantity,
                amount: sale.amount,
                paymentMethod: sale.paymentMethod
            });
        }
    });

    // Show last 10 items
    recentItems.slice(-10).forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.product}</td>
            <td>${item.quantity}</td>
            <td>R$ ${item.amount.toFixed(2).replace('.', ',')}</td>
            <td>${item.paymentMethod}</td>
        `;
        tbody.appendChild(row);
    });
}

// Charts initialization
function initializeCharts() {
    const ctx = document.getElementById('sales-chart').getContext('2d');

    // Mock data for the chart
    const chartData = {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        datasets: [{
            label: 'Vendas (R$)',
            data: [1200, 1900, 3000, 5000, 2000, 3000, 4000],
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 1
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2).replace('.', ',');
                        }
                    }
                }
            }
        }
    });
}

// Report generation
document.getElementById('generate-report-btn').addEventListener('click', function() {
    const period = document.getElementById('report-period').value;
    generateReport(period);
});

function generateReport(period) {
    let filteredSales = sales;
    const now = new Date();

    switch(period) {
        case 'today':
            const today = now.toISOString().split('T')[0];
            filteredSales = sales.filter(s => s.date.startsWith(today));
            break;
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filteredSales = sales.filter(s => new Date(s.date) >= weekAgo);
            break;
        case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            filteredSales = sales.filter(s => new Date(s.date) >= monthAgo);
            break;
        case 'year':
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            filteredSales = sales.filter(s => new Date(s.date) >= yearAgo);
            break;
    }

    let totalSales = 0;
    let totalProducts = 0;
    let totalProfit = 0;

    filteredSales.forEach(sale => {
        if (sale.totalAmount) {
            // New format
            totalSales += sale.totalAmount;
            totalProducts += sale.items.reduce((sum, item) => sum + item.quantity, 0);
            // Calculate profit for new format
            totalProfit += sale.items.reduce((itemSum, item) => {
                const product = inventory.find(p => p.name === item.product);
                const cost = product ? product.cost : 0;
                return itemSum + (item.amount - (cost * item.quantity));
            }, 0);
        } else {
            // Old format
            totalSales += sale.amount;
            totalProducts += sale.quantity;
            // Calculate profit for old format
            const product = inventory.find(p => p.name === sale.product);
            const cost = product ? product.cost : 0;
            totalProfit += (sale.amount - (cost * sale.quantity));
        }
    });

    const averageTicket = totalSales / filteredSales.length || 0;

    document.getElementById('report-total-sales').textContent = `R$ ${totalSales.toFixed(2).replace('.', ',')}`;
    document.getElementById('report-total-profit').textContent = `R$ ${totalProfit.toFixed(2).replace('.', ',')}`;
    document.getElementById('report-total-products').textContent = totalProducts;
    document.getElementById('report-average-ticket').textContent = `R$ ${averageTicket.toFixed(2).replace('.', ',')}`;
}

// Data persistence (using localStorage for demo)
function saveInventory() {
    localStorage.setItem('admin_inventory', JSON.stringify(inventory));
}

function loadInventory() {
    const saved = localStorage.getItem('admin_inventory');
    if (saved) {
        inventory = JSON.parse(saved);
    }
}

// Load data on page load
loadData();

// Clear sales functionality
document.getElementById('clear-sales-btn').addEventListener('click', function() {
    if (confirm('Tem certeza que deseja limpar todos os dados de vendas? Esta ação não pode ser desfeita.')) {
        // Clear sales data
        sales = [];

        // Reset salesToday for all inventory items
        inventory.forEach(item => {
            item.salesToday = 0;
        });

        saveData();

        // Update the dashboard
        updateInventoryTable();
        updateSalesSummary();
        updateSalesTable();
        initializeCharts();

        alert('Dados de vendas limpos com sucesso.');
    }
});

// Export inventory functionality
document.getElementById('export-inventory-btn').addEventListener('click', function() {
    const csvContent = "data:text/csv;charset=utf-8,"
        + "ID,Nome,Estoque,Preço,Vendas Hoje\n"
        + inventory.map(item => `${item.id},"${item.name}",${item.stock},"R$ ${item.price.toFixed(2).replace('.', ',')}",${item.salesToday}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "estoque_loja.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
