-- 建立使用者表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立婚紗表
CREATE TABLE IF NOT EXISTS dresses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    style VARCHAR(50) NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立預約表
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    dress_id INTEGER REFERENCES dresses(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入範例婚紗資料
INSERT INTO dresses (name, style, price, description, image) VALUES
('夢幻公主款', '蓬裙', 15000, '經典的公主風格，蓬鬆的裙擺展現優雅氣質', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400'),
('簡約魚尾款', '魚尾', 18000, '修身剪裁完美展現身材曲線，優雅大方', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400'),
('浪漫蕾絲款', 'A字', 16000, '精緻蕾絲細節，散發浪漫氛圍', 'https://images.unsplash.com/photo-1594552072238-0c0d5f5e0e3e?w=400'),
('復古宮廷款', '蓬裙', 20000, '華麗的宮廷風格，讓你成為最美的新娘', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400'),
('氣質名媛款', '直筒', 17000, '簡約時尚，展現現代女性魅力', 'https://images.unsplash.com/photo-1595122427629-2fd94f8b7bb3?w=400'),
('甜美薄紗款', 'A字', 14000, '輕盈薄紗材質，甜美可人', 'https://images.unsplash.com/photo-1582639590011-f5a8416d1101?w=400')
ON CONFLICT DO NOTHING;

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(date, time);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
