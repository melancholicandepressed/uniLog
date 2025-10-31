// Veri Yapısı - LocalStorage için
let currentUser = null;
let currentUserType = null;

// Ders Listesi
const coursesList = [
    { code: "YBS 301", name: "Yöneylem Araştırması", credit: 4, ects: 5, weeklyHours: 4 },
    { code: "YBS 391", name: "Hukuka Giriş", credit: 3, ects: 4, weeklyHours: 3 },
    { code: "YBS 305", name: "Nesneye Dayalı Programlama", credit: 3, ects: 5, weeklyHours: 3 },
    { code: "YBS 303", name: "Yazılım Kalite Yönetimi", credit: 3, ects: 4, weeklyHours: 3 },
    { code: "IYU 325", name: "İş Yeri Uygulaması", credit: 3, ects: 4, weeklyHours: 3 },
    { code: "YBS 457", name: "Web Tabanlı Uygulama Programlama", credit: 3, ects: 4, weeklyHours: 3 },
    { code: "YBS 309", name: "Kurumsal Kaynak Planlama", credit: 3, ects: 4, weeklyHours: 3 }
];

// Devamsızlık hesaplama (Dönem: 14 hafta, %70 devam zorunluluğu = %30 devamsızlık hakkı)
function calculateAbsenceLimit(ects) {
    const totalWeeks = 14;
    const totalHours = ects * totalWeeks; // AKTS = toplam saat
    const absenceRight = Math.floor(totalHours * 0.3); // %30 devamsızlık hakkı
    return absenceRight;
}

// Demo Verileri
const initialStudents = [
    {
        id: 1,
        username: "230103009",
        password: "1234",
        name: "Kaan Karameşe",
        number: "230103009",
        courses: [
            { code: "YBS 301", name: "Yöneylem Araştırması", midterm: 85, final: 88, classAvgMid: 72, classAvgFinal: 75, absence: 8, absenceLimit: 21, credit: 4, ects: 5 },
            { code: "YBS 391", name: "Hukuka Giriş", midterm: 78, final: 82, classAvgMid: 70, classAvgFinal: 73, absence: 5, absenceLimit: 16, credit: 3, ects: 4 },
            { code: "YBS 305", name: "Nesneye Dayalı Programlama", midterm: 92, final: 95, classAvgMid: 75, classAvgFinal: 78, absence: 3, absenceLimit: 21, credit: 3, ects: 5 },
            { code: "YBS 303", name: "Yazılım Kalite Yönetimi", midterm: 88, final: 90, classAvgMid: 73, classAvgFinal: 76, absence: 12, absenceLimit: 16, credit: 3, ects: 4 },
            { code: "IYU 325", name: "İş Yeri Uygulaması", midterm: 95, final: 98, classAvgMid: 80, classAvgFinal: 83, absence: 15, absenceLimit: 16, credit: 3, ects: 4 },
            { code: "YBS 457", name: "Web Tabanlı Uygulama Programlama", midterm: 90, final: 93, classAvgMid: 76, classAvgFinal: 79, absence: 13, absenceLimit: 16, credit: 3, ects: 4 },
            { code: "YBS 309", name: "Kurumsal Kaynak Planlama", midterm: 82, final: 85, classAvgMid: 71, classAvgFinal: 74, absence: 7, absenceLimit: 16, credit: 3, ects: 4 }
        ]
    },
    {
        id: 2,
        username: "230103010",
        password: "1234",
        name: "Ahmet Polat",
        number: "230103010",
        courses: [
            { code: "YBS 301", name: "Yöneylem Araştırması", midterm: 75, final: 78, classAvgMid: 72, classAvgFinal: 75, absence: 18, absenceLimit: 21, credit: 4, ects: 5 },
            { code: "YBS 391", name: "Hukuka Giriş", midterm: 82, final: 85, classAvgMid: 70, classAvgFinal: 73, absence: 10, absenceLimit: 16, credit: 3, ects: 4 },
            { code: "YBS 305", name: "Nesneye Dayalı Programlama", midterm: 70, final: 73, classAvgMid: 75, classAvgFinal: 78, absence: 19, absenceLimit: 21, credit: 3, ects: 5 },
            { code: "YBS 303", name: "Yazılım Kalite Yönetimi", midterm: 78, final: 80, classAvgMid: 73, classAvgFinal: 76, absence: 15, absenceLimit: 16, credit: 3, ects: 4 },
            { code: "IYU 325", name: "İş Yeri Uygulaması", midterm: 88, final: 90, classAvgMid: 80, classAvgFinal: 83, absence: 8, absenceLimit: 16, credit: 3, ects: 4 },
            { code: "YBS 457", name: "Web Tabanlı Uygulama Programlama", midterm: 85, final: 88, classAvgMid: 76, classAvgFinal: 79, absence: 13, absenceLimit: 16, credit: 3, ects: 4 },
            { code: "YBS 309", name: "Kurumsal Kaynak Planlama", midterm: 73, final: 76, classAvgMid: 71, classAvgFinal: 74, absence: 14, absenceLimit: 16, credit: 3, ects: 4 }
        ]
    },
    {
        id: 3,
        username: "230103011",
        password: "1234",
        name: "Ayşe Yılmaz",
        number: "230103011",
        courses: [
            { code: "YBS 301", name: "Yöneylem Araştırması", midterm: 68, final: 72, classAvgMid: 72, classAvgFinal: 75, absence: 20, absenceLimit: 21, credit: 4, ects: 5 },
            { code: "YBS 391", name: "Hukuka Giriş", midterm: 65, final: 70, classAvgMid: 70, classAvgFinal: 73, absence: 15, absenceLimit: 16, credit: 3, ects: 4 },
            { code: "YBS 305", name: "Nesneye Dayalı Programlama", midterm: 80, final: 83, classAvgMid: 75, classAvgFinal: 78, absence: 16, absenceLimit: 21, credit: 3, ects: 5 },
            { code: "YBS 303", name: "Yazılım Kalite Yönetimi", midterm: 70, final: 74, classAvgMid: 73, classAvgFinal: 76, absence: 14, absenceLimit: 16, credit: 3, ects: 4 },
            { code: "IYU 325", name: "İş Yeri Uygulaması", midterm: 75, final: 78, classAvgMid: 80, classAvgFinal: 83, absence: 12, absenceLimit: 16, credit: 3, ects: 4 },
            { code: "YBS 457", name: "Web Tabanlı Uygulama Programlama", midterm: 72, final: 75, classAvgMid: 76, classAvgFinal: 79, absence: 15, absenceLimit: 16, credit: 3, ects: 4 },
            { code: "YBS 309", name: "Kurumsal Kaynak Planlama", midterm: 77, final: 80, classAvgMid: 71, classAvgFinal: 74, absence: 11, absenceLimit: 16, credit: 3, ects: 4 }
        ]
    }
];

const initialTeachers = [
    {
        id: 1,
        username: "ahmet.ogretmen",
        password: "teacher123",
        name: "Ahmet Öztürk",
        course: "YBS 301"
    },
    {
        id: 2,
        username: "zeynep.ogretmen",
        password: "teacher123",
        name: "Zeynep Arslan",
        course: "YBS 391"
    },
    {
        id: 3,
        username: "mehmet.ogretmen",
        password: "teacher123",
        name: "Mehmet Yılmaz",
        course: "YBS 305"
    },
    {
        id: 4,
        username: "ayse.ogretmen",
        password: "teacher123",
        name: "Ayşe Demir",
        course: "YBS 303"
    },
    {
        id: 5,
        username: "can.ogretmen",
        password: "teacher123",
        name: "Can Kaya",
        course: "IYU 325"
    },
    {
        id: 6,
        username: "elif.ogretmen",
        password: "teacher123",
        name: "Elif Şahin",
        course: "YBS 457"
    },
    {
        id: 7,
        username: "ali.ogretmen",
        password: "teacher123",
        name: "Ali Çelik",
        course: "YBS 309"
    }
];

// LocalStorage İşlemleri
function initializeData() {
    // Her zaman güncel verileri kullan (geliştirme için)
    localStorage.setItem('students', JSON.stringify(initialStudents));
    localStorage.setItem('teachers', JSON.stringify(initialTeachers));
}

function getStudents() {
    return JSON.parse(localStorage.getItem('students')) || [];
}

function getTeachers() {
    return JSON.parse(localStorage.getItem('teachers')) || [];
}

function updateStudents(students) {
    localStorage.setItem('students', JSON.stringify(students));
}

// Sayfa Geçişleri
function showPage(pageId) {
    showLoading();
    setTimeout(() => {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
        hideLoading();
    }, 300);
}

function showHomePage() {
    showPage('homePage');
    clearLoginForm();
}

function showLoginPage() {
    showPage('loginPage');
}

// Loading Overlay
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

// Kullanıcı Tipi Seçimi
function selectUserType(type) {
    document.querySelectorAll('.user-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    currentUserType = type;
}

// Login İşlemi
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.classList.remove('show');
    
    // Boş alan kontrolü
    if (!username || !password) {
        errorMessage.textContent = '❌ Kullanıcı adı ve şifre boş bırakılamaz!';
        errorMessage.classList.add('show');
        return;
    }
    
    if (!currentUserType) {
        currentUserType = 'student';
    }
    
    showLoading();
    
    setTimeout(() => {
        if (currentUserType === 'student') {
            const students = getStudents();
            const student = students.find(s => s.username === username && s.password === password);
            
            if (student) {
                currentUser = student;
                loadStudentPanel();
                showPage('studentPanel');
            } else {
                errorMessage.textContent = '❌ Kullanıcı adı veya şifre hatalı!';
                errorMessage.classList.add('show');
                hideLoading();
            }
        } else if (currentUserType === 'teacher') {
            const teachers = getTeachers();
            const teacher = teachers.find(t => t.username === username && t.password === password);
            
            if (teacher) {
                currentUser = teacher;
                loadTeacherPanel();
                showPage('teacherPanel');
            } else {
                errorMessage.textContent = '❌ Kullanıcı adı veya şifre hatalı!';
                errorMessage.classList.add('show');
                hideLoading();
            }
        }
    }, 500);
}

// Login Formu Temizle
function clearLoginForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('errorMessage').classList.remove('show');
}

// Çıkış İşlemi
function logout() {
    showLoading();
    setTimeout(() => {
        currentUser = null;
        currentUserType = null;
        showHomePage();
    }, 300);
}

// Öğrenci Paneli Yükleme
function loadStudentPanel() {
    // Öğrenci Bilgileri
    document.getElementById('studentName').textContent = currentUser.name;
    document.getElementById('studentNumber').textContent = currentUser.number;
    
    // İstatistikler
    document.getElementById('totalCourses').textContent = currentUser.courses.length;
    
    // Toplam Devamsızlık Hesapla
    const totalAbsence = currentUser.courses.reduce((sum, course) => sum + (course.absence || 0), 0);
    const totalAbsenceElement = document.getElementById('totalAbsence');
    if (totalAbsenceElement) {
        totalAbsenceElement.textContent = totalAbsence;
    }
    
    // Devamsızlık Kartları Oluştur
    const attendanceGrid = document.getElementById('attendanceGrid');
    if (attendanceGrid) {
        attendanceGrid.innerHTML = '';
        
        currentUser.courses.forEach(course => {
            const percentage = ((course.absence || 0) / course.absenceLimit) * 100;
            let barClass = '';
            let statusClass = 'limit-safe';
            let statusText = '✓ Güvenli';
            
            if (percentage >= 85) {
                barClass = 'danger';
                statusClass = 'limit-danger';
                statusText = '⚠️ Sınıra Çok Yakın!';
            } else if (percentage >= 60) {
                barClass = 'warning';
                statusClass = 'limit-warning';
                statusText = '⚠️ Limite yakın';
            }
            
            const card = document.createElement('div');
            card.className = 'attendance-card';
            card.innerHTML = `
                <div class="course-header">
                    <span class="course-code">${course.code}</span>
                    <div class="course-name">${course.name}</div>
                    <div class="course-credits">
                        <span class="credit-badge">${course.credit || 3} KREDI</span>
                        <span class="ects-badge">${course.ects || 4} AKTS</span>
                    </div>
                </div>
                <div class="attendance-details">
                    <div class="attendance-stat">
                        <span class="label">Devamsızlık:</span>
                        <span class="value ${percentage >= 60 ? (percentage >= 85 ? 'danger' : 'warning') : ''}">${course.absence || 0} / ${course.absenceLimit} saat</span>
                    </div>
                    <div class="attendance-bar">
                        <div class="bar-fill ${barClass}" style="width: ${percentage}%"></div>
                    </div>
                    <div class="attendance-info">
                        <span class="${statusClass}">${statusText}</span>
                    </div>
                </div>
            `;
            attendanceGrid.appendChild(card);
        });
    }
    
    // Not Tablosu
    const tbody = document.getElementById('gradesTableBody');
    tbody.innerHTML = '';
    
    let totalAverage = 0;
    
    currentUser.courses.forEach(course => {
        const average = calculateAverage(course.midterm, course.final);
        totalAverage += average;
        
        // Sınıf ortalaması karşılaştırma
        const midAboveAvg = course.midterm > course.classAvgMid;
        const finalAboveAvg = course.final > course.classAvgFinal;
        
        // Harf notu
        const letterGrade = getLetterGrade(average);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="course-code">${course.code}</span></td>
            <td><strong>${course.name}</strong></td>
            <td><strong>${course.midterm || '-'}</strong></td>
            <td class="class-avg ${midAboveAvg ? 'above-avg' : 'below-avg'}">${course.classAvgMid}</td>
            <td><strong>${course.final || '-'}</strong></td>
            <td class="class-avg ${finalAboveAvg ? 'above-avg' : 'below-avg'}">${course.classAvgFinal}</td>
            <td><strong style="font-size: 1.1rem; color: var(--primary);">${average.toFixed(2)}</strong></td>
            <td><span class="letter-grade ${letterGrade.letter}">${letterGrade.letter}</span></td>
            <td>${getStatusBadge(average)}</td>
        `;
        tbody.appendChild(row);
    });
    
    // GPA Hesaplama
    const gpa = currentUser.courses.length > 0 ? totalAverage / currentUser.courses.length : 0;
    document.getElementById('gpa').textContent = gpa.toFixed(2);
}

// Not Hesaplama (Vize %40 + Final %60)
function calculateAverage(midterm, final) {
    if (!midterm || !final) return 0;
    return (midterm * 0.4) + (final * 0.6);
}

// Harf Notu Hesaplama
function getLetterGrade(average) {
    if (average >= 90) return { letter: 'AA', gpa: 4.00 };
    if (average >= 85) return { letter: 'BA', gpa: 3.50 };
    if (average >= 75) return { letter: 'BB', gpa: 3.00 };
    if (average >= 70) return { letter: 'CB', gpa: 2.50 };
    if (average >= 60) return { letter: 'CC', gpa: 2.00 };
    if (average >= 55) return { letter: 'DC', gpa: 1.50 };
    if (average >= 50) return { letter: 'DD', gpa: 1.00 };
    if (average >= 40) return { letter: 'FD', gpa: 0.50 };
    if (average > 0) return { letter: 'FF', gpa: 0.00 };
    return { letter: 'NA', gpa: 0.00 };
}

// Durum Badge'i
function getStatusBadge(average) {
    if (!average || average === 0) {
        return '<span class="status-badge pending">Bekliyor</span>';
    } else if (average >= 50) {
        return '<span class="status-badge passed">Geçti ✓</span>';
    } else {
        return '<span class="status-badge failed">Kaldı ✗</span>';
    }
}

// Öğretmen Paneli Yükleme
function loadTeacherPanel() {
    // Öğretmen Bilgileri
    document.getElementById('teacherName').textContent = currentUser.name;
    // Kurs kodu yerine kurs adını göster
    try {
        const courseInfo = (typeof coursesList !== 'undefined' && Array.isArray(coursesList))
            ? coursesList.find(c => c.code === currentUser.course)
            : null;
        document.getElementById('teacherCourse').textContent = courseInfo?.name || currentUser.course;
    } catch (_) {
        document.getElementById('teacherCourse').textContent = currentUser.course;
    }
    
    const students = getStudents();
    const courseStudents = students.filter(student => 
        student.courses.some(course => course.code === currentUser.course)
    );
    
    // İstatistikleri Hesapla
    let totalAverage = 0;
    let passedCount = 0;
    let failedCount = 0;
    
    courseStudents.forEach(student => {
        const courseData = student.courses.find(c => c.code === currentUser.course);
        const avg = calculateAverage(courseData.midterm, courseData.final);
        totalAverage += avg;
        if (avg >= 50) passedCount++;
        else if (avg > 0) failedCount++;
    });
    
    const classAverage = courseStudents.length > 0 ? totalAverage / courseStudents.length : 0;
    
    // İstatistikleri Güncelle
    document.getElementById('totalStudents').textContent = courseStudents.length;
    document.getElementById('classAverage').textContent = classAverage.toFixed(2);
    document.getElementById('passedStudents').textContent = passedCount;
    document.getElementById('failedStudents').textContent = failedCount;
    
    // Not Tablosunu Doldur
    const tbody = document.getElementById('teacherGradesTableBody');
    tbody.innerHTML = '';
    
    courseStudents.forEach(student => {
        const courseData = student.courses.find(c => c.code === currentUser.course);
        const average = calculateAverage(courseData.midterm, courseData.final);
        const letterGrade = getLetterGrade(average);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${student.number}</strong></td>
            <td><strong>${student.name}</strong></td>
            <td><strong>${courseData.midterm || '-'}</strong></td>
            <td><strong>${courseData.final || '-'}</strong></td>
            <td><strong style="font-size: 1.1rem; color: var(--primary);">${average.toFixed(2)}</strong></td>
            <td><span class="letter-grade ${letterGrade.letter}">${letterGrade.letter}</span></td>
            <td>${courseData.absence || 0} / ${courseData.absenceLimit} saat</td>
            <td>${getStatusBadge(average)}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Not Güncelleme Kartlarını Doldur
    const studentsGrid = document.getElementById('studentsGrid');
    studentsGrid.innerHTML = '';
    
    courseStudents.forEach(student => {
        const courseData = student.courses.find(c => c.code === currentUser.course);
        
        const studentCard = document.createElement('div');
        studentCard.className = 'student-card';
        studentCard.innerHTML = `
            <div class="student-header">
                <div>
                    <div class="student-name">${student.name}</div>
                    <div class="student-number">Öğrenci No: ${student.number}</div>
                </div>
                <div>
                    <strong>Ortalama: </strong>
                    <span style="color: var(--primary); font-size: 1.2rem;">
                        ${calculateAverage(courseData.midterm, courseData.final).toFixed(2)}
                    </span>
                </div>
            </div>
            <div class="grades-input">
                <div class="input-group">
                    <label>Vize Notu</label>
                    <input type="number" 
                           class="midterm-input" 
                           data-student-id="${student.id}"
                           min="0" 
                           max="100" 
                           value="${courseData.midterm || ''}"
                           placeholder="0-100">
                </div>
                <div class="input-group">
                    <label>Final Notu</label>
                    <input type="number" 
                           class="final-input" 
                           data-student-id="${student.id}"
                           min="0" 
                           max="100" 
                           value="${courseData.final || ''}"
                           placeholder="0-100">
                </div>
            </div>
        `;
        studentsGrid.appendChild(studentCard);
    });
}

// Notları Kaydetme
function saveGrades() {
    showLoading();
    
    setTimeout(() => {
        const students = getStudents();
        const midtermInputs = document.querySelectorAll('.midterm-input');
        const finalInputs = document.querySelectorAll('.final-input');
        
        let updatedCount = 0;
        
        midtermInputs.forEach((input, index) => {
            const studentId = parseInt(input.dataset.studentId);
            const midterm = parseFloat(input.value) || 0;
            const final = parseFloat(finalInputs[index].value) || 0;
            
            // Validasyon
            if (midterm < 0 || midterm > 100 || final < 0 || final > 100) {
                alert('Notlar 0-100 arasında olmalıdır!');
                hideLoading();
                return;
            }
            
            const student = students.find(s => s.id === studentId);
            if (student) {
                const course = student.courses.find(c => c.code === currentUser.course);
                if (course) {
                    course.midterm = midterm;
                    course.final = final;
                    updatedCount++;
                }
            }
        });
        
        updateStudents(students);
        
        // Paneli yeniden yükle
        loadTeacherPanel();
        
        // Başarı Mesajı
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = `✓ ${updatedCount} öğrencinin notları başarıyla kaydedildi!`;
        successMessage.classList.add('show');
        
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 3000);
        
        // Paneli yenile
        loadTeacherPanel();
        hideLoading();
    }, 500);
}

// ==================== NAVBAR SCROLL & HAMBURGER ====================
// Navbar scroll efekti
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    // Parallax scroll effect
    parallaxScroll();
});

// ==================== PARALLAX EFFECTS ====================
function parallaxScroll() {
    const scrollY = window.scrollY;
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    
    parallaxLayers.forEach((layer, index) => {
        const speed = (index + 1) * 0.15;
        const yPos = -(scrollY * speed);
        layer.style.transform = `translateY(${yPos}px)`;
    });
    
    // Floating cards parallax
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        const speed = 0.2 + (index * 0.08);
        const yPos = -(scrollY * speed);
        const baseTransform = card.style.animation ? '' : '';
        card.style.transform = `translateY(${yPos}px)`;
    });
}

// Mouse move parallax effect (subtle)
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function updateParallaxMouse() {
    // Smooth interpolation
    targetX += (mouseX - targetX) * 0.1;
    targetY += (mouseY - targetY) * 0.1;
    
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    parallaxLayers.forEach((layer, index) => {
        const speed = (index + 1) * 10;
        const xPos = targetX * speed;
        const yPos = targetY * speed;
        
        layer.style.transform = `translate(${xPos}px, ${yPos}px)`;
    });
    
    // Floating cards mouse parallax
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        const speed = 8 + (index * 3);
        const xPos = targetX * speed;
        const yPos = targetY * speed;
        
        // Combine with scroll parallax
        const scrollY = window.scrollY;
        const scrollSpeed = 0.2 + (index * 0.08);
        const scrollYPos = -(scrollY * scrollSpeed);
        
        card.style.transform = `translate(${xPos}px, ${yPos + scrollYPos}px)`;
    });
    
    requestAnimationFrame(updateParallaxMouse);
}

// Start mouse parallax animation
updateParallaxMouse();

// Hamburger menü
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Menü linklerine tıklandığında menüyü kapat
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Menü dışına tıklandığında kapat
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    
    // Login formları için
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        selectUserType('student');
        
        // Enter tuşu ile form gönderimi
        loginForm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLogin(e);
            }
        });
    }

    // Scroll animasyonları için Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate creator cards
    document.querySelectorAll('.creator-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.2}s`;
        observer.observe(card);
    });

    // Animate footer columns
    document.querySelectorAll('.footer-column').forEach((col, index) => {
        col.style.opacity = '0';
        col.style.transform = 'translateY(20px)';
        col.style.transition = `all 0.5s ease ${index * 0.1}s`;
        observer.observe(col);
    });
});

// Input validasyonları
document.addEventListener('input', (e) => {
    if (e.target.type === 'number') {
        const value = parseFloat(e.target.value);
        if (value < 0) e.target.value = 0;
        if (value > 100) e.target.value = 100;
    }
});

// showLoginPage fonksiyonunu güncelle - user type parametresi ekle
const originalShowLoginPage = showLoginPage;
function showLoginPage(userType) {
    if (userType) {
        selectUserType(userType);
    }
    showPage('loginPage');
}

