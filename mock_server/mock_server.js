const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock 데이터
let users = [];
let orders = [];
let menuItems = [
  { item_id: 1, name: '스테이크 디너', price: 35000, category: '메인', available: true, stock_quantity: 50 },
  { item_id: 2, name: '파스타', price: 18000, category: '메인', available: true, stock_quantity: 30 },
  { item_id: 3, name: '샐러드', price: 12000, category: '사이드', available: true, stock_quantity: 40 }
];

// 인증
app.post('/auth/register', (req, res) => {
  const { username, password, email, role } = req.body;
  

  const isDuplicate = users.some(
    (user) => user.username === username || user.email === email
  );

  if (isDuplicate) {
    return res.status(409).json({ error: '이미 등록된 아이디 또는 이메일입니다.' });
  }


  const user_id = users.length + 1;
  users.push({ user_id, username, password, email, role });
  res.status(201).json({ message: 'User registered successfully', user_id });
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    res.json({
      token: `mock-token-${user.user_id}`,
      user_id: user.user_id,
      role: user.role
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// 메뉴
app.get('/menu', (req, res) => {
  res.json(menuItems);
});

app.get('/menu/:item_id', (req, res) => {
  const item = menuItems.find(i => i.item_id === parseInt(req.params.item_id));
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Menu item not found' });
  }
});

// 주문
app.post('/orders', (req, res) => {
  const { customer_id, items } = req.body;
  const order_id = orders.length + 1;
  const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const order = {
    order_id,
    customer_id,
    items,
    state: 'Created',
    total_amount,
    created_at: new Date()
  };
  
  orders.push(order);
  res.status(201).json({ order_id, state: 'Created', total_amount });
});

app.get('/orders/:order_id', (req, res) => {
  const order = orders.find(o => o.order_id === parseInt(req.params.order_id));
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// 배송
app.get('/delivery/status/:order_id', (req, res) => {
  const order = orders.find(o => o.order_id === parseInt(req.params.order_id));
  if (order) {
    res.json({ order_id: order.order_id, status: 'EnRoute' });
  } else {
    res.status(404).json({ error: 'Delivery not found' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /auth/register');
  console.log('  POST /auth/login');
  console.log('  GET  /menu');
  console.log('  POST /orders');
  console.log('  GET  /orders/:order_id');
  console.log('  GET  /delivery/status/:order_id');
});