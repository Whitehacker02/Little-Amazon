const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));
app.get('/', (req, res) => { 
    res.sendfile(path.join(__dirname, 'index.html'));
                           });

const ORDERS_FILE = path.join(__dirname, 'orders.json');

function readOrders() {
    if (!fs.existsSync(ORDERS_FILE)) {
        fs.writeFileSync(ORDERS_FILE, "{}");
    }
    return JSON.parse(fs.readFileSync(ORDERS_FILE));
}

function writeOrders(data) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2));
}

/* 🛒 CREATE ORDER */
app.post('/api/create-order', (req, res) => {
    const { product } = req.body;

    const code = uuidv4();

    const orders = readOrders();

    orders[code] = {
        trackingCode: code,
        product,
        status: "Processing",
        lastUpdate: new Date().toISOString()
    };

    writeOrders(orders);

    res.json({ trackingCode: code });
});

/* 🔍 TRACK ORDER */
app.get('/api/order', (req, res) => {
    const code = req.query.code;

    const orders = readOrders();

    if (!orders[code]) {
        return res.status(404).json({ error: "Order not found" });
    }

    res.json(orders[code]);
});

/* 📦 ADMIN UPDATE STATUS */
app.post('/api/admin/update-status', (req, res) => {
    const { code, status } = req.body;

    const orders = readOrders();

    if (!orders[code]) {
        return res.status(404).json({ error: "Order not found" });
    }

    orders[code].status = status;
    orders[code].lastUpdate = new Date().toISOString();

    writeOrders(orders);

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

