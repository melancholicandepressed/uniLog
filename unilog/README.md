# Unilog - Not Yönetim Sistemi

Ostim Teknik Üniversitesi için geliştirilmiş, Firebase entegrasyonlu modern not yönetim sistemi.

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Firebase Yapılandırması

Firebase yapılandırması `firebase-config.js` dosyasında yapılmıştır. Gerekirse API anahtarlarınızı güncelleyin.

### 3. Projeyi Çalıştır

```bash
npm start
```

Veya geliştirme modu için:

```bash
npm run dev
```

Tarayıcıda `http://localhost:8080` adresini açın.

## 📁 Proje Yapısı

```
unilog/
├── assets/           # Görseller (logo, profil resimleri)
├── index.html        # Ana HTML dosyası
├── script.js         # JavaScript mantığı (Firebase entegrasyonlu)
├── style.css         # Stil dosyası
├── firebase-config.js # Firebase yapılandırması
└── package.json      # Proje bağımlılıkları
```

## 🔥 Firebase Koleksiyonları

Proje şu Firebase koleksiyonlarını kullanır:

- **students**: Öğrenci bilgileri ve notları
- **teachers**: Öğretmen bilgileri

### İlk Kurulumda Veri İçe Aktarımı

**Yöntem 1: Otomatik (Önerilen)**
- Ana sayfayı açtığınızda veriler otomatik eklenir (eğer Firebase boşsa)
- Console'da "Firebase'e demo verileri ekleniyor..." mesajını görebilirsiniz

**Yöntem 2: Manuel Kurulum Sayfası**
- `setup-data.html` dosyasını tarayıcıda açın: `http://localhost:8080/setup-data.html`
- "Demo Verileri Ekle" butonuna tıklayın
- Başarı mesajını bekleyin

Demo veriler:
- 3 demo öğrenci hesabı
- 7 demo öğretmen hesabı

## 👤 Demo Hesaplar

### Öğrenciler:
- **Kaan Karameşe**: `230103009 / 1234`
- **Ahmet Polat**: `230103010 / 1234`
- **Ayşe Yılmaz**: `230103011 / 1234`

### Öğretmenler:
- **Ahmet Öztürk** (YBS 301): `ahmet.ogretmen / teacher123`
- **Zeynep Arslan** (YBS 391): `zeynep.ogretmen / teacher123`
- **Mehmet Yılmaz** (YBS 305): `mehmet.ogretmen / teacher123`
- **Ayşe Demir** (YBS 303): `ayse.ogretmen / teacher123`
- **Can Kaya** (IYU 325): `can.ogretmen / teacher123`
- **Elif Şahin** (YBS 457): `elif.ogretmen / teacher123`
- **Ali Çelik** (YBS 309): `ali.ogretmen / teacher123`

## 🔧 Firebase Güvenlik Kuralları

Firebase Console'da Firestore Database için şu güvenlik kurallarını ayarlayın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Öğrenciler koleksiyonu - okuma/yazma izni (geliştirme için)
    match /students/{document=**} {
      allow read, write: if true; // Production'da daha sıkı kurallar kullanın
    }
    
    // Öğretmenler koleksiyonu - okuma/yazma izni (geliştirme için)
    match /teachers/{document=**} {
      allow read, write: if true; // Production'da daha sıkı kurallar kullanın
    }
  }
}
```

⚠️ **Not**: Production ortamında daha güvenli kurallar kullanmalısınız!

## 🎨 Özellikler

- ✅ Firebase Firestore entegrasyonu
- ✅ Öğrenci not takibi
- ✅ Öğretmen not girişi
- ✅ Devamsızlık takibi
- ✅ Modern UI/UX (Glassmorphism/Claymorphism)
- ✅ Responsive tasarım
- ✅ Parallax efektler

## 👨‍💻 Geliştiriciler

- **Kaan Karameşe** - Ostim Teknik Üniversitesi YBS Öğrencisi
- **Ahmet Polat** - Ostim Teknik Üniversitesi YBS Öğrencisi

## 📝 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.

