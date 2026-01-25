// API 基礎 URL
const API_URL = 'http://localhost:3001/api';

// 全域變數
let currentUser = null;
let authToken = null;
let allDresses = [];

// 頁面載入時執行
document.addEventListener('DOMContentLoaded', () => {
    // 檢查是否已登入
    checkLoginStatus();
    // 載入婚紗列表
    loadDresses();
    // 設定日期選擇器的最小日期為今天
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        dateInput.setAttribute('min', today);
    }
});

// 檢查登入狀態
function checkLoginStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        updateNavButtons(true);
    } else {
        updateNavButtons(false);
    }
}

// 更新導航按鈕
function updateNavButtons(isLoggedIn) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const myBookingsBtn = document.getElementById('myBookingsBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (isLoggedIn) {
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        myBookingsBtn.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        myBookingsBtn.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }
}

// 顯示區塊
function showSection(section) {
    // 隱藏所有區塊
    document.getElementById('homeSection').classList.add('hidden');
    document.getElementById('dressesSection').classList.add('hidden');
    document.getElementById('myBookingsSection').classList.add('hidden');
    
    // 顯示指定區塊
    if (section === 'home') {
        document.getElementById('homeSection').classList.remove('hidden');
    } else if (section === 'dresses') {
        document.getElementById('dressesSection').classList.remove('hidden');
        loadDresses();
    } else if (section === 'my-bookings') {
        if (!authToken) {
            alert('請先登入');
            showLoginModal();
            return;
        }
        document.getElementById('myBookingsSection').classList.remove('hidden');
        loadMyBookings();
    }
    
    // 捲動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 載入婚紗列表
async function loadDresses() {
    try {
        const response = await fetch(`${API_URL}/dresses`);
        const dresses = await response.json();
        allDresses = dresses;
        
        const dressesList = document.getElementById('dressesList');
        dressesList.innerHTML = dresses.map(dress => `
            <div class="dress-card bg-white rounded-lg shadow-lg overflow-hidden">
                <img src="${dress.image}" alt="${dress.name}" class="w-full h-64 object-cover">
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-2">${dress.name}</h3>
                    <p class="text-gray-600 mb-2">風格: ${dress.style}</p>
                    <p class="text-gray-600 mb-4">${dress.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-2xl font-bold text-pink-600">NT$ ${dress.price.toLocaleString()}</span>
                        <button onclick="showBookingModal(${dress.id})" class="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600">
                            預約試穿
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('載入婚紗列表失敗:', error);
        alert('載入婚紗列表失敗，請稍後再試');
    }
}

// 顯示登入 Modal
function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

// 顯示註冊 Modal
function showRegisterModal() {
    document.getElementById('registerModal').classList.add('active');
}

// 關閉 Modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// 處理登入
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // 儲存登入資訊
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // 更新 UI
            updateNavButtons(true);
            closeModal('loginModal');
            alert(`歡迎回來，${currentUser.username}！`);
            
            // 清空表單
            document.getElementById('loginForm').reset();
        } else {
            alert(data.error || '登入失敗');
        }
    } catch (error) {
        console.error('登入錯誤:', error);
        alert('登入失敗，請稍後再試');
    }
}

// 處理註冊
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value;
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, phone })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('註冊成功！請登入');
            closeModal('registerModal');
            showLoginModal();
            
            // 清空表單
            document.getElementById('registerForm').reset();
        } else {
            alert(data.error || '註冊失敗');
        }
    } catch (error) {
        console.error('註冊錯誤:', error);
        alert('註冊失敗，請稍後再試');
    }
}

// 登出
function logout() {
    if (confirm('確定要登出嗎？')) {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        updateNavButtons(false);
        showSection('home');
        alert('已成功登出');
    }
}

// 顯示預約 Modal
function showBookingModal(dressId) {
    if (!authToken) {
        alert('請先登入才能預約');
        showLoginModal();
        return;
    }
    
    const dress = allDresses.find(d => d.id === dressId);
    if (!dress) return;
    
    // 顯示婚紗資訊
    document.getElementById('bookingDressInfo').innerHTML = `
        <div class="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
            <img src="${dress.image}" alt="${dress.name}" class="w-20 h-20 object-cover rounded">
            <div>
                <h3 class="font-bold">${dress.name}</h3>
                <p class="text-gray-600 text-sm">${dress.style} | NT$ ${dress.price.toLocaleString()}</p>
            </div>
        </div>
    `;
    
    document.getElementById('bookingDressId').value = dressId;
    document.getElementById('bookingModal').classList.add('active');
}

// 處理預約
async function handleBooking(event) {
    event.preventDefault();
    
    const dressId = document.getElementById('bookingDressId').value;
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const notes = document.getElementById('bookingNotes').value;
    
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ dressId, date, time, notes })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('預約成功！我們會盡快與您確認');
            closeModal('bookingModal');
            
            // 清空表單
            document.getElementById('bookingForm').reset();
            
            // 如果在我的預約頁面，重新載入
            if (!document.getElementById('myBookingsSection').classList.contains('hidden')) {
                loadMyBookings();
            }
        } else {
            alert(data.error || '預約失敗');
        }
    } catch (error) {
        console.error('預約錯誤:', error);
        alert('預約失敗，請稍後再試');
    }
}

// 載入我的預約記錄
async function loadMyBookings() {
    try {
        const response = await fetch(`${API_URL}/bookings/my`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const bookings = await response.json();
        
        const bookingsList = document.getElementById('bookingsList');
        
        if (bookings.length === 0) {
            bookingsList.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-gray-500 text-lg mb-4">目前沒有預約記錄</p>
                    <button onclick="showSection('dresses')" class="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600">
                        立即預約
                    </button>
                </div>
            `;
            return;
        }
        
        bookingsList.innerHTML = bookings.map(booking => {
            const statusText = {
                'pending': '待確認',
                'confirmed': '已確認',
                'cancelled': '已取消'
            }[booking.status];
            
            const statusClass = {
                'pending': 'bg-yellow-100 text-yellow-800',
                'confirmed': 'bg-green-100 text-green-800',
                'cancelled': 'bg-gray-100 text-gray-800'
            }[booking.status];
            
            return `
                <div class="bg-white rounded-lg shadow-lg p-6 mb-4">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div class="flex items-start space-x-4 mb-4 md:mb-0">
                            ${booking.dress ? `<img src="${booking.dress.image}" alt="${booking.dress.name}" class="w-20 h-20 object-cover rounded">` : ''}
                            <div>
                                <h3 class="font-bold text-lg">${booking.dress ? booking.dress.name : '婚紗已下架'}</h3>
                                <p class="text-gray-600">預約日期: ${booking.date}</p>
                                <p class="text-gray-600">預約時間: ${booking.time}</p>
                                ${booking.notes ? `<p class="text-gray-600 text-sm mt-2">備註: ${booking.notes}</p>` : ''}
                            </div>
                        </div>
                        <div class="flex flex-col items-end space-y-2">
                            <span class="px-3 py-1 rounded-full text-sm font-medium ${statusClass}">
                                ${statusText}
                            </span>
                            ${booking.status === 'pending' || booking.status === 'confirmed' ? `
                                <button onclick="cancelBooking(${booking.id})" class="text-red-500 hover:text-red-700 text-sm">
                                    取消預約
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('載入預約記錄失敗:', error);
        alert('載入預約記錄失敗，請稍後再試');
    }
}

// 取消預約
async function cancelBooking(bookingId) {
    if (!confirm('確定要取消這個預約嗎？')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('預約已取消');
            loadMyBookings();
        } else {
            alert(data.error || '取消預約失敗');
        }
    } catch (error) {
        console.error('取消預約錯誤:', error);
        alert('取消預約失敗，請稍後再試');
    }
}
