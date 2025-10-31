// Firebase is loaded via CDN in index.html and available globally
// Use window object to access Firebase functions
// Wait for Firebase to be ready
let db, collection, getDocs, doc, getDoc, updateDoc, addDoc;

function initFirebase() {
    if (window.firebaseDb && window.firebaseCollection) {
        db = window.firebaseDb;
        collection = window.firebaseCollection;
        getDocs = window.firebaseGetDocs;
        doc = window.firebaseDoc;
        getDoc = window.firebaseGetDoc;
        updateDoc = window.firebaseUpdateDoc;
        addDoc = window.firebaseAddDoc;
        return true;
    }
    return false;
}

// Try to init immediately, or wait a bit
if (!initFirebase()) {
    let attempts = 0;
    const checkFirebase = setInterval(() => {
        if (initFirebase() || attempts++ > 20) {
            clearInterval(checkFirebase);
            if (!db) {
                console.error('Firebase başlatılamadı!');
            }
        }
    }, 100);
}

// Veri Yapısı - Firebase için
let currentUser = null;
let currentUserType = null;
let teacherTableStudents = [];
let teacherTableStudentsOriginal = [];
let currentSortColumn = null;
let sortDirection = 'asc';

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

function calculateAbsenceLimit(ects) {
    const totalWeeks = 14;
    const totalHours = ects * totalWeeks;
    const absenceRight = Math.floor(totalHours * 0.3);
    return absenceRight;
}

async function initializeData() {
    if (!db || !collection) {
        console.warn('Firebase henüz hazır değil, bekleniyor...');
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!initFirebase()) {
            console.error('Firebase başlatılamadı!');
            return;
        }
    }
    
    try {
        console.log('Firebase bağlantısı hazır!');
    } catch (error) {
        console.error('Firebase başlatma hatası:', error);
    }
}

async function getStudents() {
    try {
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const students = [];
        studentsSnapshot.forEach((docSnap) => {
            // Firebase doküman ID'sini açıkça sakla
            // ÖNEMLİ: Önce spread yap, sonra id'yi override et (Firebase doküman ID'si gerçek ID'dir)
            const studentData = docSnap.data();
            students.push({ 
                ...studentData,  // Önce veriyi yay (içinde id: 1, 2, 3 olabilir)
                id: docSnap.id   // Sonra Firebase doküman ID'sini override et (GERÇEK ID!)
            });
        });
        console.log('✅ Öğrenciler yüklendi:', students.map(s => ({ 
            firebaseDocId: s.id,  // Bu artık Firebase doküman ID'si
            name: s.name,
            number: s.number 
        })));
        return students;
    } catch (error) {
        console.error('Öğrencileri getirme hatası:', error);
        return [];
    }
}

async function getTeachers() {
    try {
        const teachersSnapshot = await getDocs(collection(db, 'teachers'));
        const teachers = [];
        teachersSnapshot.forEach((doc) => {
            teachers.push({ id: doc.id, ...doc.data() });
        });
        return teachers;
    } catch (error) {
        console.error('Öğretmenleri getirme hatası:', error);
        return [];
    }
}

async function updateStudent(studentId, updatedData) {
    try {
        const studentRef = doc(db, 'students', studentId);
        await updateDoc(studentRef, updatedData);
        return true;
    } catch (error) {
        console.error('Öğrenci güncelleme hatası:', error);
        return false;
    }
}

async function updateStudentCourse(studentId, courseCode, courseData) {
    try {
        // Firebase bağlantısını kontrol et
        if (!db || !doc || !updateDoc) {
            console.error('Firebase fonksiyonları hazır değil!');
            return false;
        }

        // Öğrenci verisini Firebase'den al
        const student = await getStudentById(studentId);
        if (!student) {
            console.error(`Öğrenci bulunamadı: ${studentId}`);
            return false;
        }
        
        // Öğrencinin ders listesini güncelle
        const updatedCourses = student.courses.map(course => 
            course.code === courseCode 
                ? { ...course, ...courseData } 
                : course
        );
        
        // Firebase'de öğrenciyi güncelle (POST/UPDATE işlemi)
        const studentRef = doc(db, 'students', studentId);
        await updateDoc(studentRef, {
            courses: updatedCourses
        });
        
        console.log(`✅ Öğrenci ${studentId} için ${courseCode} dersi güncellendi:`, courseData);
        return true;
    } catch (error) {
        console.error('Öğrenci ders güncelleme hatası:', error);
        console.error('Hata detayı:', {
            studentId,
            courseCode,
            courseData,
            errorMessage: error.message
        });
        return false;
    }
}

async function getStudentById(studentId) {
    try {
        if (!studentId) {
            console.error('getStudentById: studentId boş!');
            return null;
        }
        
        console.log(`Öğrenci aranıyor (ID: ${studentId})...`);
        const studentDoc = await getDoc(doc(db, 'students', studentId));
        
        if (studentDoc.exists()) {
            const studentData = studentDoc.data();
            const student = { 
                id: studentDoc.id,  // Firebase doküman ID'si
                ...studentData      // Diğer veriler
            };
            console.log(`✅ Öğrenci bulundu: ${student.name} (ID: ${student.id})`);
            return student;
        } else {
            console.error(`❌ Öğrenci bulunamadı! Doküman ID: ${studentId}`);
            // Tüm öğrencileri listele (debug için)
            const allStudents = await getStudents();
            console.log('Mevcut öğrenci ID\'leri:', allStudents.map(s => s.id));
            return null;
        }
    } catch (error) {
        console.error('Öğrenci getirme hatası:', error);
        console.error('Hata detayı:', {
            studentId,
            errorMessage: error.message,
            errorCode: error.code
        });
        return null;
    }
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
async function handleLogin(event) {
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
    
    try {
        if (currentUserType === 'student') {
            const students = await getStudents();
            const student = students.find(s => s.username === username && s.password === password);
            
            if (student) {
                currentUser = student;
                await loadStudentPanel();
                showPage('studentPanel');
            } else {
                errorMessage.textContent = '❌ Kullanıcı adı veya şifre hatalı!';
                errorMessage.classList.add('show');
                hideLoading();
            }
        } else if (currentUserType === 'teacher') {
            const teachers = await getTeachers();
            const teacher = teachers.find(t => t.username === username && t.password === password);
            
            if (teacher) {
                currentUser = teacher;
                await loadTeacherPanel();
                showPage('teacherPanel');
            } else {
                errorMessage.textContent = '❌ Kullanıcı adı veya şifre hatalı!';
                errorMessage.classList.add('show');
                hideLoading();
            }
        }
    } catch (error) {
        console.error('Login hatası:', error);
        errorMessage.textContent = '❌ Giriş sırasında bir hata oluştu!';
        errorMessage.classList.add('show');
        hideLoading();
    }
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
async function loadStudentPanel() {
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
    
    // GPA Hesaplama (4.0 üzerinden)
    let totalGPA = 0;
    let totalCredits = 0;
    
    currentUser.courses.forEach(course => {
        const average = calculateAverage(course.midterm, course.final);
        const letterGrade = getLetterGrade(average);
        const courseGPA = letterGrade.gpa;
        const courseCredits = course.ects || course.credit || 3; // AKTS veya kredi
        
        totalGPA += courseGPA * courseCredits;
        totalCredits += courseCredits;
    });
    
    const gpa = totalCredits > 0 ? totalGPA / totalCredits : 0;
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
async function loadTeacherPanel() {
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
    
    const students = await getStudents();
    const courseStudents = students.filter(student => 
        student.courses.some(course => course.code === currentUser.course)
    );
    
    teacherTableStudents = courseStudents.map(student => {
        const courseData = student.courses.find(c => c.code === currentUser.course);
        const average = calculateAverage(courseData.midterm, courseData.final);
        const letterGrade = getLetterGrade(average);
        return {
            ...student,
            courseData,
            average,
            letterGrade
        };
    });
    
    teacherTableStudentsOriginal = [...teacherTableStudents];
    
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
    
    const searchInput = document.getElementById('studentSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    currentSortColumn = null;
    sortDirection = 'asc';
    
    renderTeacherTable();
    
    // Not Güncelleme Kartlarını Doldur
    const studentsGrid = document.getElementById('studentsGrid');
    studentsGrid.innerHTML = '';
    
    courseStudents.forEach(student => {
        const courseData = student.courses.find(c => c.code === currentUser.course);
        
        // Firebase doküman ID'sini kullan (veri içindeki id alanını değil)
        const firebaseDocId = student.id; // Bu Firebase'den gelen gerçek doküman ID'si olmalı
        
        console.log(`Öğrenci kartı oluşturuluyor: ${student.name}, Firebase ID: ${firebaseDocId}`);
        
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
                           data-student-id="${firebaseDocId}"
                           min="0" 
                           max="100" 
                           value="${courseData.midterm || ''}"
                           placeholder="0-100">
                </div>
                <div class="input-group">
                    <label>Final Notu</label>
                    <input type="number" 
                           class="final-input" 
                           data-student-id="${firebaseDocId}"
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

function renderTeacherTable() {
    const tbody = document.getElementById('teacherGradesTableBody');
    tbody.innerHTML = '';
    
    teacherTableStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${student.number}</strong></td>
            <td><strong>${student.name}</strong></td>
            <td><strong>${student.courseData.midterm || '-'}</strong></td>
            <td><strong>${student.courseData.final || '-'}</strong></td>
            <td><strong style="font-size: 1.1rem; color: var(--primary);">${student.average.toFixed(2)}</strong></td>
            <td><span class="letter-grade ${student.letterGrade.letter}">${student.letterGrade.letter}</span></td>
            <td>${student.courseData.absence || 0} / ${student.courseData.absenceLimit} saat</td>
            <td>${getStatusBadge(student.average)}</td>
        `;
        tbody.appendChild(row);
    });
    
    updateSortIcons();
}

function sortTable(column) {
    if (currentSortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        sortDirection = 'asc';
    }
    
    teacherTableStudents.sort((a, b) => {
        let aVal, bVal;
        
        switch(column) {
            case 'number':
                aVal = parseInt(a.number) || 0;
                bVal = parseInt(b.number) || 0;
                break;
            case 'name':
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                break;
            case 'midterm':
                aVal = a.courseData.midterm || 0;
                bVal = b.courseData.midterm || 0;
                break;
            case 'final':
                aVal = a.courseData.final || 0;
                bVal = b.courseData.final || 0;
                break;
            case 'average':
                aVal = a.average || 0;
                bVal = b.average || 0;
                break;
            case 'letter':
                const letterOrder = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF', 'NA'];
                aVal = letterOrder.indexOf(a.letterGrade.letter);
                bVal = letterOrder.indexOf(b.letterGrade.letter);
                break;
            case 'absence':
                aVal = a.courseData.absence || 0;
                bVal = b.courseData.absence || 0;
                break;
            default:
                return 0;
        }
        
        if (typeof aVal === 'string') {
            return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        } else {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
    });
    
    renderTeacherTable();
}

function updateSortIcons() {
    document.querySelectorAll('.sort-icon').forEach(icon => {
        icon.textContent = '';
    });
    
    if (currentSortColumn) {
        const header = document.querySelector(`th[data-sort="${currentSortColumn}"] .sort-icon`);
        if (header) {
            header.textContent = sortDirection === 'asc' ? ' ▲' : ' ▼';
        }
    }
}

function filterStudents() {
    const searchTerm = document.getElementById('studentSearchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        teacherTableStudents = [...teacherTableStudentsOriginal];
    } else {
        teacherTableStudents = teacherTableStudentsOriginal.filter(student => 
            student.name.toLowerCase().includes(searchTerm) ||
            student.number.includes(searchTerm)
        );
    }
    
    if (currentSortColumn) {
        const column = currentSortColumn;
        const direction = sortDirection;
        currentSortColumn = null;
        sortTable(column);
        currentSortColumn = column;
        sortDirection = direction === 'asc' ? 'desc' : 'asc';
        sortTable(column);
    } else {
        renderTeacherTable();
    }
}

// Notları Kaydetme - Firebase'e dinamik POST/UPDATE
async function saveGrades() {
    showLoading();
    
    try {
        // Firebase kontrolü
        if (!db || !collection || !updateDoc) {
            alert('Firebase bağlantısı kurulamadı! Lütfen sayfayı yenileyin.');
            hideLoading();
            return;
        }

        const midtermInputs = document.querySelectorAll('.midterm-input');
        const finalInputs = document.querySelectorAll('.final-input');
        
        if (midtermInputs.length === 0 || finalInputs.length === 0) {
            alert('Güncellenecek öğrenci bulunamadı!');
            hideLoading();
            return;
        }

        let updatedCount = 0;
        let failedCount = 0;
        const updatePromises = [];
        const updateResults = [];
        
        // Her öğrenci için güncelleme işlemi
        for (let i = 0; i < midtermInputs.length; i++) {
            const input = midtermInputs[i];
            const finalInput = finalInputs[i];
            const studentId = input.dataset.studentId;
            const midterm = parseFloat(input.value) || 0;
            const final = parseFloat(finalInput.value) || 0;
            
            console.log(`📝 Öğrenci ${i + 1} güncelleniyor:`, {
                studentId,
                midterm,
                final,
                course: currentUser.course
            });
            
            // Validasyon
            if (midterm < 0 || midterm > 100 || final < 0 || final > 100) {
                alert(`Öğrenci ${i + 1}: Notlar 0-100 arasında olmalıdır!`);
                hideLoading();
                return;
            }
            
            // Firebase'e POST/UPDATE işlemi başlat
            const updatePromise = updateStudentCourse(studentId, currentUser.course, {
                midterm: midterm,
                final: final
            }).then(success => {
                updateResults.push({ studentId, success });
                if (success) {
                    console.log(`✅ Öğrenci ${i + 1} başarıyla güncellendi (ID: ${studentId})`);
                } else {
                    console.error(`❌ Öğrenci ${i + 1} güncellenemedi (ID: ${studentId})`);
                }
                return success;
            });
            
            updatePromises.push(updatePromise);
        }
        
        // Tüm Firebase güncellemelerini bekle
        const results = await Promise.allSettled(updatePromises);
        
        // Sonuçları değerlendir
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value === true) {
                updatedCount++;
            } else {
                failedCount++;
                console.error(`Öğrenci ${index + 1} güncellenemedi:`, result);
            }
        });
        
        // Paneli Firebase'den yeniden yükle (güncel veriler için)
        await loadTeacherPanel();
        
        // Başarı/Hata Mesajı
        const successMessage = document.getElementById('successMessage');
        if (failedCount === 0) {
            successMessage.textContent = `✅ ${updatedCount} öğrencinin notları Firebase'e başarıyla kaydedildi!`;
            successMessage.className = 'success-message show';
            console.log(`✅ Tüm notlar Firebase'e kaydedildi: ${updatedCount} öğrenci`);
        } else {
            successMessage.textContent = `⚠️ ${updatedCount} öğrenci güncellendi, ${failedCount} öğrenci güncellenemedi!`;
            successMessage.className = 'error-message show';
            console.warn(`⚠️ Kısmi başarı: ${updatedCount} başarılı, ${failedCount} başarısız`);
        }
        
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);
        
        hideLoading();
    } catch (error) {
        console.error('Not kaydetme hatası:', error);
        alert(`Notlar kaydedilirken bir hata oluştu: ${error.message}`);
        hideLoading();
    }
}

// ==================== NAVBAR SCROLL & HAMBURGER ====================
// Navbar scroll durumunu kontrol et
function checkNavbarScroll() {
    const scrollY = window.scrollY;
    
    // Landing page navbar
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    // Student panel navbar
    const navbarStudent = document.getElementById('navbarStudent');
    if (navbarStudent) {
        if (scrollY > 50) {
            navbarStudent.classList.add('scrolled');
        } else {
            navbarStudent.classList.remove('scrolled');
        }
    }
    
    // Teacher panel navbar
    const navbarTeacher = document.getElementById('navbarTeacher');
    if (navbarTeacher) {
        if (scrollY > 50) {
            navbarTeacher.classList.add('scrolled');
        } else {
            navbarTeacher.classList.remove('scrolled');
        }
    }
}

// Navbar scroll efekti (tüm navbar'lar için)
window.addEventListener('scroll', () => {
    checkNavbarScroll();
    
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
document.addEventListener('DOMContentLoaded', async () => {
    await initializeData();
    
    // Sayfa yüklendiğinde navbar scroll durumunu kontrol et
    checkNavbarScroll();
    
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

// showLoginPage fonksiyonu - user type parametresi ile
function showLoginPage(userType) {
    if (userType) {
        selectUserType(userType);
    }
    showPage('loginPage');
}

// HTML'deki onclick event'leri için global erişim
function exposeFunctions() {
    window.showLoginPage = showLoginPage;
    window.showHomePage = showHomePage;
    window.handleLogin = handleLogin;
    window.selectUserType = selectUserType;
    window.logout = logout;
    window.saveGrades = saveGrades;
    window.sortTable = sortTable;
    window.filterStudents = filterStudents;
}

// Expose functions immediately and on DOM ready
exposeFunctions();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', exposeFunctions);
} else {
    exposeFunctions();
}

