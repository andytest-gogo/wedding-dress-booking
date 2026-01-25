require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-in-production';

// 中介軟體
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// JWT 驗證中介軟體
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: '未授權訪問' });
    }
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: '無效的令牌' });
        }
        req.user = user;
        next();
    });
}

// ===== API 路由 =====

// 健康檢查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '伺服器運行正常' });
});

// 使用者註冊
app.post('/api/register', async (req, res) => {
    const client = await pool.connect();
    try {
        const { username, email, password, phone } = req.body;
        
        // 驗證必填欄位
        if (!username || !email || !password) {
            return res.status(400).json({ error: '請填寫所有必填欄位' });
        }
        
        // 檢查使用者是否已存在
        const userCheck = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: '此 Email 已被註冊' });
        }
        
        // 加密密碼
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 建立新使用者
        const result = await client.query(
            'INSERT INTO users (username, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id',
            [username, email, hashedPassword, phone || '']
        );
        
        res.status(201).json({ 
            message: '註冊成功', 
            userId: result.rows[0].id 
        });
    } catch (error) {
        console.error('註冊錯誤:', error);
        res.status(500).json({ error: '註冊失敗' });
    } finally {
        client.release();
    }
});

// 使用者登入
app.post('/api/login', async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, password } = req.body;
        
        const result = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Email 或密碼錯誤' });
        }
        
        const user = result.rows[0];
        
        // 驗證密碼
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Email 或密碼錯誤' });
        }
        
        // 產生 JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            SECRET_KEY,
            { expiresIn: '24h' }
        );
        
        res.json({
            message: '登入成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('登入錯誤:', error);
        res.status(500).json({ error: '登入失敗' });
    } finally {
        client.release();
    }
});

// 取得所有婚紗
app.get('/api/dresses', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT * FROM dresses ORDER BY id'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('取得婚紗列表錯誤:', error);
        res.status(500).json({ error: '取得婚紗列表失敗' });
    } finally {
        client.release();
    }
});

// 取得單一婚紗詳情
app.get('/api/dresses/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT * FROM dresses WHERE id = $1',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到此婚紗' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('取得婚紗詳情錯誤:', error);
        res.status(500).json({ error: '取得婚紗詳情失敗' });
    } finally {
        client.release();
    }
});

// 建立預約（需要登入）
app.post('/api/bookings', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { dressId, date, time, notes } = req.body;
        
        if (!dressId || !date || !time) {
            return res.status(400).json({ error: '請填寫所有必填欄位' });
        }
        
        // 檢查時段是否已被預約
        const existingBooking = await client.query(
            'SELECT * FROM bookings WHERE date = $1 AND time = $2 AND status != $3',
            [date, time, 'cancelled']
        );
        
        if (existingBooking.rows.length > 0) {
            return res.status(400).json({ error: '此時段已被預約，請選擇其他時段' });
        }
        
        // 建立新預約
        const result = await client.query(
            'INSERT INTO bookings (user_id, dress_id, date, time, notes, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [req.user.id, dressId, date, time, notes || '', 'pending']
        );
        
        res.status(201).json({ 
            message: '預約成功', 
            booking: result.rows[0] 
        });
    } catch (error) {
        console.error('建立預約錯誤:', error);
        res.status(500).json({ error: '建立預約失敗' });
    } finally {
        client.release();
    }
});

// 取得使用者的預約記錄（需要登入）
app.get('/api/bookings/my', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT 
                b.id, b.user_id, b.dress_id, b.date, b.time, b.notes, b.status, b.created_at,
                d.name as dress_name, d.style as dress_style, d.price as dress_price, 
                d.description as dress_description, d.image as dress_image
            FROM bookings b
            LEFT JOIN dresses d ON b.dress_id = d.id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC`,
            [req.user.id]
        );
        
        // 格式化回傳資料
        const bookings = result.rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            dressId: row.dress_id,
            date: row.date,
            time: row.time,
            notes: row.notes,
            status: row.status,
            createdAt: row.created_at,
            dress: row.dress_id ? {
                id: row.dress_id,
                name: row.dress_name,
                style: row.dress_style,
                price: row.dress_price,
                description: row.dress_description,
                image: row.dress_image
            } : null
        }));
        
        res.json(bookings);
    } catch (error) {
        console.error('取得預約記錄錯誤:', error);
        res.status(500).json({ error: '取得預約記錄失敗' });
    } finally {
        client.release();
    }
});

// 取消預約（需要登入）
app.patch('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            ['cancelled', req.params.id, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: '找不到此預約' });
        }
        
        res.json({ 
            message: '預約已取消', 
            booking: result.rows[0] 
        });
    } catch (error) {
        console.error('取消預約錯誤:', error);
        res.status(500).json({ error: '取消預約失敗' });
    } finally {
        client.release();
    }
});

// 檢查時段是否可用
app.get('/api/bookings/check-availability', async (req, res) => {
    const client = await pool.connect();
    try {
        const { date, time } = req.query;
        
        if (!date || !time) {
            return res.status(400).json({ error: '請提供日期和時間' });
        }
        
        const result = await client.query(
            'SELECT * FROM bookings WHERE date = $1 AND time = $2 AND status != $3',
            [date, time, 'cancelled']
        );
        
        res.json({ available: result.rows.length === 0 });
    } catch (error) {
        console.error('檢查時段錯誤:', error);
        res.status(500).json({ error: '檢查時段失敗' });
    } finally {
        client.release();
    }
});

// 提供前端頁面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// 啟動伺服器
const startServer = async () => {
    try {
        // 測試資料庫連接
        await pool.query('SELECT NOW()');
        console.log('✅ 資料庫連接測試成功');
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 伺服器運行在 port ${PORT}`);
            console.log(`📍 環境: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('❌ 啟動失敗:', error);
        process.exit(1);
    }
};

startServer();
