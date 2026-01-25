# 婚紗預約網站

一個完整的婚紗預約系統，包含前端介面、後端 API 和資料儲存功能。

## 功能特色

### 使用者功能
- ✅ 會員註冊與登入
- ✅ 瀏覽婚紗款式
- ✅ 預約試穿婚紗
- ✅ 查看預約記錄
- ✅ 取消預約

### 技術特色
- 前端：HTML + Tailwind CSS + JavaScript
- 後端：Node.js + Express
- 資料庫：JSON 檔案儲存（輕量化方案）
- 使用者驗證：JWT (JSON Web Token)
- 密碼加密：bcrypt

## 安裝步驟

### 1. 確認環境
確保你的電腦已安裝：
- Node.js (版本 14 或以上)
- npm (通常隨 Node.js 一起安裝)

檢查版本：
```bash
node --version
npm --version
```

### 2. 安裝相依套件
如果你下載了這個專案，請先安裝所需套件：
```bash
npm install
```

## 啟動網站

### 方法一：使用 npm 指令
```bash
npm start
```

### 方法二：直接執行
```bash
node backend/server.js
```

啟動後，你會看到訊息：
```
資料檔案初始化完成
伺服器運行在 http://localhost:3001
```

## 使用網站

1. 打開瀏覽器，前往：`http://localhost:3001`

2. 首次使用請先註冊帳號：
   - 點擊右上角「註冊」按鈕
   - 填寫姓名、Email、密碼等資訊
   - 完成註冊

3. 登入帳號：
   - 使用剛註冊的 Email 和密碼登入

4. 瀏覽婚紗款式：
   - 點擊「婚紗款式」查看所有婚紗
   - 系統已預設 6 款婚紗供試用

5. 預約試穿：
   - 選擇喜歡的婚紗
   - 點擊「預約試穿」
   - 選擇日期和時間
   - 送出預約

6. 查看預約記錄：
   - 點擊「我的預約」查看所有預約
   - 可以取消尚未完成的預約

## 專案結構

```
wedding-dress-booking/
├── backend/
│   └── server.js          # 後端伺服器主程式
├── frontend/
│   └── public/
│       ├── index.html     # 前端 HTML 頁面
│       └── app.js         # 前端 JavaScript 邏輯
├── data/                  # 資料儲存目錄（自動生成）
│   ├── users.json        # 使用者資料
│   ├── bookings.json     # 預約記錄
│   └── dresses.json      # 婚紗資料
├── package.json          # npm 專案設定檔
└── README.md            # 說明文件

```

## API 端點說明

### 使用者相關
- `POST /api/register` - 註冊新使用者
- `POST /api/login` - 使用者登入

### 婚紗相關
- `GET /api/dresses` - 取得所有婚紗
- `GET /api/dresses/:id` - 取得單一婚紗詳情

### 預約相關
- `POST /api/bookings` - 建立預約（需登入）
- `GET /api/bookings/my` - 取得我的預約記錄（需登入）
- `PATCH /api/bookings/:id/cancel` - 取消預約（需登入）
- `GET /api/bookings/check-availability` - 檢查時段是否可用

## 資料格式說明

### 使用者資料 (users.json)
```json
{
  "id": 1,
  "username": "王小明",
  "email": "user@example.com",
  "password": "加密後的密碼",
  "phone": "0912345678",
  "createdAt": "2026-01-25T00:00:00.000Z"
}
```

### 預約記錄 (bookings.json)
```json
{
  "id": 1,
  "userId": 1,
  "dressId": 1,
  "date": "2026-02-14",
  "time": "14:00",
  "notes": "希望可以試穿兩件",
  "status": "pending",
  "createdAt": "2026-01-25T00:00:00.000Z"
}
```

### 婚紗資料 (dresses.json)
```json
{
  "id": 1,
  "name": "夢幻公主款",
  "style": "蓬裙",
  "price": 15000,
  "description": "經典的公主風格...",
  "image": "圖片網址"
}
```

## 常見問題

### Q: 如何停止伺服器？
A: 在終端機按 `Ctrl + C`

### Q: 如何重設資料？
A: 刪除 `data` 資料夾，重新啟動伺服器即可

### Q: 可以修改婚紗資料嗎？
A: 可以直接編輯 `data/dresses.json` 檔案

### Q: 密碼忘記怎麼辦？
A: 目前沒有忘記密碼功能，可以直接刪除 `data/users.json` 中的該使用者重新註冊

### Q: 如何在其他電腦上查看？
A: 
1. 找到你的電腦 IP 位址
2. 修改 `frontend/public/app.js` 中的 API_URL
3. 其他電腦使用 `http://你的IP:3001` 訪問

## 未來擴充建議

1. **後台管理系統**
   - 管理員登入
   - 婚紗上架/下架
   - 預約審核與管理

2. **進階功能**
   - 圖片上傳功能
   - Email 通知
   - 簡訊提醒
   - 線上付款

3. **資料庫升級**
   - 改用 MySQL 或 PostgreSQL
   - 更好的資料查詢效能

4. **UI/UX 優化**
   - 響應式設計優化
   - 更多動畫效果
   - 圖片輪播

## 授權

此專案僅供學習使用。

## 聯絡資訊

如有問題歡迎詢問！
