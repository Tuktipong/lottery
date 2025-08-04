// ข้อมูลและการตั้งค่า
const PASSWORD = "3902002";
const LOTTERY_NUMBERS = [
    384920, 219384, 847362, 190283, 736451, 504312, 648295, 382716, 729183, 195837,
    483920, 615384, 827364, 940271, 163849, 738492, 274839, 196427, 308194, 527316,
    619283, 473829, 821746, 309481, 246813, 685294, 934710, 749283, 821493, 657182,
    918273, 564738, 372849, 493820, 710294, 583920, 294817, 361840, 742983, 693210,
    814729, 206384, 918346, 370284, 549283, 638201, 127349, 459182, 630194, 892374
];

// ตัวแปรสถานะ
let isLoggedIn = false;
let drawHistory = [];
let usedNumbers = new Set(); // เก็บหมายเลขที่สุ่มไปแล้ว

// เริ่มต้นโปรแกรม
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // โหลดข้อมูลจาก localStorage
    loadDataFromStorage();
    
    // ตั้งค่าเหตุการณ์ต่างๆ
    setupEventListeners();
    
    // อัปเดตข้อมูลเบื้องต้น
    updateStatistics();
    
    // เริ่มต้นที่หน้าล็อกอิน
    showScreen('loginScreen');
    
    // อัปเดตเวลาทุกวินาที
    updateTime();
    setInterval(updateTime, 1000);
}

function setupEventListeners() {
    // Enter key ในช่องรหัสผ่าน
    document.getElementById('passwordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
    
    // ปิด modal เมื่อคลิกนอกกรอบ
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('numberModal');
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // บันทึกข้อมูลก่อนปิดหน้าเว็บ
    window.addEventListener('beforeunload', function() {
        saveDataToStorage();
    });
}

// ฟังก์ชันจัดการ localStorage
function saveDataToStorage() {
    const data = {
        drawHistory: drawHistory,
        usedNumbers: Array.from(usedNumbers),
        lastSaved: new Date().toISOString()
    };
    localStorage.setItem('lotteryData', JSON.stringify(data));
}

function loadDataFromStorage() {
    const savedData = localStorage.getItem('lotteryData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            drawHistory = data.drawHistory || [];
            usedNumbers = new Set(data.usedNumbers || []);
        } catch (error) {
            console.log('ไม่สามารถโหลดข้อมูลเก่าได้');
            resetAllData();
        }
    }
}

function clearStorage() {
    localStorage.removeItem('lotteryData');
}

function resetAllData() {
    drawHistory = [];
    usedNumbers = new Set();
    updateStatistics();
    document.getElementById('resultContainer').innerHTML = '';
    saveDataToStorage();
}

function showScreen(screenId) {
    // ซ่อนหน้าจอทั้งหมด
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // แสดงหน้าจอที่ต้องการ
    document.getElementById(screenId).classList.add('active');
    
    // อัปเดตข้อมูลสถิติเมื่อเข้าหน้าหลัก
    if (screenId === 'mainScreen') {
        updateStatistics();
        restoreLastResult();
    }
}

function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value;
    
    if (password === PASSWORD) {
        isLoggedIn = true;
        showScreen('mainScreen');
        passwordInput.value = '';
        showSuccessMessage('เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ');
    } else {
        showErrorMessage('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่');
        passwordInput.value = '';
        passwordInput.focus();
        
        // เอฟเฟกต์สั่นช่องรหัสผ่าน
        passwordInput.parentElement.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            passwordInput.parentElement.style.animation = '';
        }, 500);
    }
}

function drawLottery() {
    if (!isLoggedIn) {
        showErrorMessage('กรุณาล็อกอินก่อนใช้งาน');
        return;
    }
    
    // ตรวจสอบว่ามีหมายเลขเหลือไหม
    if (usedNumbers.size >= LOTTERY_NUMBERS.length) {
        showWarningMessage('หมายเลขสลากหมดแล้ว! กรุณารีเซ็ทเพื่อเริ่มใหม่');
        return;
    }
    
    // ปิดปุ่มชั่วคราว
    const drawButton = document.getElementById('drawButton');
    drawButton.disabled = true;
    
    // แสดง loading
    showLoading();
    
    // จำลองการโหลด
    setTimeout(() => {
        // หาหมายเลขที่ยังไม่ได้ใช้
        const availableNumbers = LOTTERY_NUMBERS.filter(num => !usedNumbers.has(num));
        
        if (availableNumbers.length === 0) {
            hideLoading();
            drawButton.disabled = false;
            showWarningMessage('หมายเลขสลากหมดแล้ว!');
            return;
        }
        
        // สุ่มหมายเลขจากที่เหลือ
        const selectedNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        
        // เพิ่มเข้าไปในชุดที่ใช้แล้ว
        usedNumbers.add(selectedNumber);
        
        // บันทึกประวัติ
        const drawRecord = {
            number: selectedNumber,
            timestamp: new Date(),
            id: Date.now()
        };
        drawHistory.unshift(drawRecord);
        
        // บันทึกลง localStorage
        saveDataToStorage();
        
        // แสดงผลลัพธ์
        displayResult(drawRecord);
        
        // อัปเดตสถิติ
        updateStatistics();
        
        // ซ่อน loading
        hideLoading();
        
        // เปิดปุ่มอีกครั้ง
        drawButton.disabled = false;
        
        // เล่นเสียง (ถ้ามี)
        playSuccessSound();
        
    }, 2000); // รอ 2 วินาที
}

function drawNewLottery() {
    if (!isLoggedIn) {
        showErrorMessage('กรุณาล็อกอินก่อนใช้งาน');
        return;
    }
    
    // ปิดปุ่มชั่วคราว
    const drawButton = document.getElementById('drawButton');
    drawButton.disabled = true;
    
    // แสดง loading
    showLoading();
    
    // จำลองการโหลด
    setTimeout(() => {
        // สุ่มหมายเลขใหม่จากทั้งหมด (ไม่สนใจว่าเคยสุ่มไปแล้วหรือไม่)
        const selectedNumber = LOTTERY_NUMBERS[Math.floor(Math.random() * LOTTERY_NUMBERS.length)];
        
        // บันทึกประวัติ
        const drawRecord = {
            number: selectedNumber,
            timestamp: new Date(),
            id: Date.now(),
            isNewDraw: true // ระบุว่าเป็นการสุ่มใหม่
        };
        drawHistory.unshift(drawRecord);
        
        // บันทึกลง localStorage
        saveDataToStorage();
        
        // แสดงผลลัพธ์
        displayResult(drawRecord);
        
        // อัปเดตสถิติ
        updateStatistics();
        
        // ซ่อน loading
        hideLoading();
        
        // เปิดปุ่มอีกครั้ง
        drawButton.disabled = false;
        
        // เล่นเสียง (ถ้ามี)
        playSuccessSound();
        
    }, 2000);
}

function displayResult(drawRecord) {
    const resultContainer = document.getElementById('resultContainer');
    
    // ข้อความแสดงความยินดีแบบสุ่ม
    const congratsMessages = [
        "🎊 ขอแสดงความยินดี! 🎊",
        "✨ โชคดีมาก! ✨",
        "🌟 ยอดเยี่ยม! 🌟",
        "🎈 สุดยอด! 🎈",
        "🎯 ได้แล้ว! 🎯",
    ];
    
    const randomCongrats = congratsMessages[Math.floor(Math.random() * congratsMessages.length)];
    
    // ตรวจสอบว่าเป็นการสุ่มใหม่หรือไม่
    const drawTypeText = drawRecord.isNewDraw ? "🔄 สุ่มใหม่" : "🎲 สุ่มครั้งแรก";
    
    resultContainer.innerHTML = `
        <div class="result-title">
            🎉 ผลการสุ่มสลากออมคะแนน 🎉
        </div>
        
        <div class="draw-type">
            ${drawTypeText}
        </div>
        
        <div class="result-number">
            <div class="number">${drawRecord.number}</div>
        </div>
        
        <div class="congrats">
            ${randomCongrats}
        </div>
        
        <div class="timestamp">
            📅 เวลาที่สุ่ม: ${formatDateTime(drawRecord.timestamp)}
        </div>
        
        <div class="draw-count">
            🎯 ครั้งที่ ${drawHistory.length} ในการสุ่ม
        </div>
    `;
    
    // เอฟเฟกต์ปรบมือ
    createConfetti();
}

function restoreLastResult() {
    if (drawHistory.length > 0) {
        displayResult(drawHistory[0]);
    }
}

function updateStatistics() {
    // อัปเดตจำนวนหมายเลขทั้งหมด
    document.getElementById('totalNumbers').textContent = LOTTERY_NUMBERS.length;
    
    // อัปเดตจำนวนที่เหลือ
    const remainingElement = document.getElementById('remainingNumbers');
    if (remainingElement) {
        const remaining = LOTTERY_NUMBERS.length - usedNumbers.size;
        remainingElement.textContent = remaining;
        
        // เปลี่ยนสีตามจำนวนที่เหลือ
        if (remaining === 0) {
            remainingElement.style.color = '#f44336';
        } else if (remaining <= 10) {
            remainingElement.style.color = '#ff9800';
        } else {
            remainingElement.style.color = '#4caf50';
        }
    }
    
    // อัปเดตจำนวนครั้งที่สุ่ม
    const drawCountElement = document.getElementById('drawCount');
    if (drawCountElement) {
        drawCountElement.textContent = drawHistory.length;
    }
}

function showAllNumbers() {
    const modal = document.getElementById('numberModal');
    const allNumbersContainer = document.getElementById('allNumbers');
    
    // เตรียมข้อมูลหมายเลข
    allNumbersContainer.innerHTML = '';
    
    LOTTERY_NUMBERS.forEach((number, index) => {
        const numberElement = document.createElement('div');
        numberElement.className = 'number-item';
        
        // ตรวจสอบสถานะ
        if (usedNumbers.has(number)) {
            numberElement.classList.add('used');
            numberElement.innerHTML = `${number} ✓`;
            numberElement.title = 'สุ่มไปแล้ว';
        } else {
            numberElement.textContent = number;
            numberElement.title = 'ยังไม่ได้สุ่ม';
        }
        
        // เพิ่มเอฟเฟกต์หากเพิ่งสุ่มได้
        if (drawHistory.length > 0 && drawHistory[0].number === number) {
            numberElement.classList.add('latest');
            if (!numberElement.innerHTML.includes('⭐')) {
                numberElement.innerHTML += ' ⭐';
            }
        }
        
        allNumbersContainer.appendChild(numberElement);
    });
    
    modal.style.display = 'block';
}

function resetLottery() {
    const confirmed = confirm(
        '⚠️ คุณต้องการรีเซ็ทการสุ่มทั้งหมดหรือไม่?\n\n' +
        '- ข้อมูลการสุ่มทั้งหมดจะถูกลบ\n' +
        '- หมายเลขทั้งหมดจะกลับมาใช้ได้อีกครั้ง\n' +
        '- การกระทำนี้ไม่สามารถย้อนกลับได้'
    );
    
    if (confirmed) {
        resetAllData();
        clearStorage();
        showSuccessMessage('รีเซ็ทข้อมูลเรียบร้อยแล้ว! เริ่มต้นใหม่');
    }
}

function closeModal() {
    document.getElementById('numberModal').style.display = 'none';
}

function logout() {
    if (confirm('คุณต้องการออกจากระบบและกลับไปหน้าล็อกอินหรือไม่?')) {
        isLoggedIn = false;
        showScreen('loginScreen');
        
        // โฟกัสช่องรหัสผ่าน
        setTimeout(() => {
            document.getElementById('passwordInput').focus();
        }, 100);
        
        showInfoMessage('ออกจากระบบเรียบร้อยแล้ว');
    }
}

function showLoading() {
    document.getElementById('loadingAnimation').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingAnimation').style.display = 'none';
}

function updateTime() {
    const now = new Date();
    const timeString = formatDateTime(now);
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

function formatDateTime(date) {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    return date.toLocaleDateString('th-TH', options);
}

// ฟังก์ชันแสดงข้อความ
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showInfoMessage(message) {
    showMessage(message, 'info');
}

function showWarningMessage(message) {
    showMessage(message, 'warning');
}

function showMessage(message, type) {
    // สร้าง toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    
    // สไตล์ toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        animation: 'slideIn 0.3s ease-out',
        minWidth: '250px',
        textAlign: 'center'
    });
    
    // สีตามประเภท
    switch(type) {
        case 'success':
            toast.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            break;
        case 'error':
            toast.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';
            break;
        case 'info':
            toast.style.background = 'linear-gradient(45deg, #2196F3, #1976D2)';
            break;
        case 'warning':
            toast.style.background = 'linear-gradient(45deg, #ff9800, #f57c00)';
            break;
    }
    
    document.body.appendChild(toast);
    
    // ลบหลัง 4 วินาที
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// เอฟเฟกต์ confetti
function createConfetti() {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
        }, i * 10);
    }
}

function createConfettiPiece(color) {
    const confetti = document.createElement('div');
    
    Object.assign(confetti.style, {
        position: 'fixed',
        width: '10px',
        height: '10px',
        backgroundColor: color,
        left: Math.random() * window.innerWidth + 'px',
        top: '-10px',
        zIndex: '1000',
        pointerEvents: 'none',
        borderRadius: '50%'
    });
    
    document.body.appendChild(confetti);
    
    // แอนิเมชันตกลงมา
    const animation = confetti.animate([
        { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${window.innerHeight + 100}px) rotate(360deg)`, opacity: 0 }
    ], {
        duration: 3000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    animation.onfinish = () => {
        if (document.body.contains(confetti)) {
            document.body.removeChild(confetti);
        }
    };
}

// ฟังก์ชันเล่นเสียง (จำลอง)
function playSuccessSound() {
    console.log('🔊 เล่นเสียงแสดงความยินดี');
}

// เพิ่ม CSS สำหรับ toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// ป้องกันการคลิกขวา (เพิ่มความปลอดภัย)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// ป้องกันการใช้ F12
document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
    }
});
