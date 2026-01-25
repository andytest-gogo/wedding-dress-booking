const { Pool } = require('pg');

// 建立資料庫連接池
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 測試連接
pool.on('connect', () => {
    console.log('✅ 資料庫連接成功');
});

pool.on('error', (err) => {
    console.error('❌ 資料庫連接錯誤:', err);
});

module.exports = pool;
