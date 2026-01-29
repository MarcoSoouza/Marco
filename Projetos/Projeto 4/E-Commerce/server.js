const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Default data
const defaultInventory = [
    { id: 1, name: 'Smart TV 55” TCL 55C6K 4K', stock: 5, price: 3900.00, cost: 3900.00, salesToday: 0, image: 'Imagem/Smart TV 55” TCL 55C6K 4K QD-Mini Led 144Hz Sistema Operacional Google TV.jpeg' },
    { id: 2, name: 'Apple iPhone 16 (128 GB) – Preto', stock: 10, price: 5000.00, cost: 4000.00, salesToday: 0, image: 'Imagem/Apple-iPhone-17-Pro-color-lineup_.webp' },
    { id: 3, name: 'Controle Sony DualSense PS5, Sem Fio, Branco', stock: 15, price: 350.00, cost: 250.00, salesToday: 0, image: 'Imagem/Controle Sony DualSense PS5, Sem Fio, Branco.webp' },
    { id: 4, name: 'PlayStation 5 Edição Digital 825GB', stock: 10, price: 4500.00, cost: 4000.00, salesToday: 0, image: 'Imagem/PS5.jfif' }
];

const defaultSales = [];

// Helper function to read JSON file
function readJSONFile(filename, defaultData) {
    try {
        const filePath = path.join(__dirname, filename);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } else {
            return defaultData;
        }
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return defaultData;
    }
}

// Helper function to write JSON file
function writeJSONFile(filename, data) {
    try {
        const filePath = path.join(__dirname, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`${filename} updated`);
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
    }
}

// Function to trigger Git sync
function triggerGitSync() {
    const scriptPath = path.join(__dirname, 'auto_commit_push.ps1');
    const powershell = spawn('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', scriptPath], {
        stdio: 'inherit'
    });

    powershell.on('close', (code) => {
        console.log(`Git sync script exited with code ${code}`);
    });

    powershell.on('error', (error) => {
        console.error('Error running Git sync script:', error);
    });
}

// API endpoints
app.get('/api/inventory', (req, res) => {
    const inventory = readJSONFile('inventory.json', defaultInventory);
    res.json(inventory);
});

app.post('/api/inventory', (req, res) => {
    const inventory = req.body;
    writeJSONFile('inventory.json', inventory);
    triggerGitSync();
    res.json({ success: true });
});

app.get('/api/sales', (req, res) => {
    const sales = readJSONFile('sales.json', defaultSales);
    res.json(sales);
});

app.post('/api/sales', (req, res) => {
    const sales = req.body;
    writeJSONFile('sales.json', sales);
    triggerGitSync();
    res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
