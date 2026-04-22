const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3000;

/* ── 路徑設定 ── */
const DATA_DIR    = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const MENU_FILE   = path.join(DATA_DIR, 'menu.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

/* ── 初始化資料夾 ── */
[DATA_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/* ── 初始菜單資料（首次啟動時寫入）── */
const DEFAULT_MENU = [
  { id:1, name:'香煎雞胸佐藜麥蔬菜碗',     price:180, img:'images/meal1.png', available:true },
  { id:2, name:'彩蔬板腱牛排全麥義大利麵', price:220, img:'images/meal2.png', available:true },
  { id:3, name:'酪梨抹醬全麥吐司佐白蝦',   price:200, img:'images/meal3.png', available:true },
  { id:4, name:'烤鯖魚地瓜健康餐盒',       price:190, img:'images/meal4.png', available:true },
  { id:5, name:'蒜泥白肉藜麥健康餐',       price:180, img:'images/meal5.png', available:true },
  { id:6, name:'檸香鮭魚蕎麥麵',           price:210, img:'images/meal6.png', available:true },
  { id:7, name:'滑蛋牛肉墨西哥捲餅',       price:195, img:'images/meal7.png', available:true },
];

if (!fs.existsSync(MENU_FILE))
  fs.writeFileSync(MENU_FILE, JSON.stringify(DEFAULT_MENU, null, 2), 'utf8');
if (!fs.existsSync(ORDERS_FILE))
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf8');

/* ── JSON 工具 ── */
const readJSON  = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');

/* ── Multer（圖片上傳）── */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `meal_${Date.now()}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

/* ── Middleware ── */
app.use(express.json());
app.use(express.static(__dirname));      // 服務 index.html / order-system.html
app.use('/uploads', express.static(UPLOADS_DIR));

/* ════════════════════════════════
   菜單 API
════════════════════════════════ */

// 取得所有餐點
app.get('/api/menu', (req, res) => {
  res.json(readJSON(MENU_FILE));
});

// 新增餐點（含圖片上傳）
app.post('/api/menu', upload.single('image'), (req, res) => {
  const menu   = readJSON(MENU_FILE);
  const newId  = menu.length ? Math.max(...menu.map(m => m.id)) + 1 : 1;
  const imgUrl = req.file ? `/uploads/${req.file.filename}` : '';
  const item   = {
    id:        newId,
    name:      req.body.name,
    price:     parseInt(req.body.price),
    img:       imgUrl,
    available: true,
  };
  menu.push(item);
  writeJSON(MENU_FILE, menu);
  res.json(item);
});

// 更新餐點（價格 / 上下架）
app.put('/api/menu/:id', (req, res) => {
  const menu = readJSON(MENU_FILE);
  const idx  = menu.findIndex(m => m.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: '找不到餐點' });
  menu[idx] = { ...menu[idx], ...req.body };
  writeJSON(MENU_FILE, menu);
  res.json(menu[idx]);
});

// 刪除餐點
app.delete('/api/menu/:id', (req, res) => {
  let menu = readJSON(MENU_FILE);
  menu = menu.filter(m => m.id !== parseInt(req.params.id));
  writeJSON(MENU_FILE, menu);
  res.json({ ok: true });
});

/* ════════════════════════════════
   訂單 API
════════════════════════════════ */

// 取得所有訂單
app.get('/api/orders', (req, res) => {
  res.json(readJSON(ORDERS_FILE));
});

// 新增訂單
app.post('/api/orders', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  orders.unshift(req.body);
  writeJSON(ORDERS_FILE, orders);
  res.json({ ok: true });
});

// 更新訂單狀態
app.put('/api/orders/:num', (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const idx    = orders.findIndex(o => o.num === req.params.num);
  if (idx === -1) return res.status(404).json({ error: '找不到訂單' });
  orders[idx] = { ...orders[idx], ...req.body };
  writeJSON(ORDERS_FILE, orders);
  res.json(orders[idx]);
});

// 刪除訂單
app.delete('/api/orders/:num', (req, res) => {
  let orders = readJSON(ORDERS_FILE);
  orders = orders.filter(o => o.num !== req.params.num);
  writeJSON(ORDERS_FILE, orders);
  res.json({ ok: true });
});

/* ── 啟動 ── */
app.listen(PORT, () => {
  console.log(`✅ 健人餐盒後端啟動成功`);
  console.log(`👉 請開啟瀏覽器前往：http://localhost:${PORT}/order-system.html`);
});
