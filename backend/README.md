# TezGo Backend 🚀

Express.js + TypeScript + Prisma + PostgreSQL + Socket.IO asosidagi taxi app backend.

---

## Texnologiyalar

| Texnologiya | Maqsad |
|---|---|
| Express 5 | HTTP server |
| TypeScript | Type xavfsizligi |
| Prisma | ORM (PostgreSQL) |
| JWT | Autentifikatsiya |
| bcrypt | Parol shifrlash |
| Socket.IO | Real-time lokatsiya va buyurtmalar |

---

## Loyiha tuzilmasi

```
src/
├── server.ts              # Entry point
├── prisma/client.ts       # Prisma singleton
├── middleware/auth.ts     # JWT + rol tekshiruvi
├── auth/                  # Ro'yxatdan o'tish, kirish
├── orders/                # Buyurtmalar CRUD
├── drivers/               # Haydovchi boshqaruvi
├── matching/              # Eng yaqin haydovchi topish
└── sockets/               # Socket.IO real-time
```

---

## Ishga tushirish

### 1. Talablar
- Node.js 18+
- PostgreSQL 14+

### 2. O'rnatish

```bash
# Papkaga kiring
cd tezgo-backend

# Paketlarni o'rnating
npm install

# .env faylini yarating
cp .env.example .env
# .env ichida DATABASE_URL ni o'zgartiring
```

### 3. Database sozlash

```bash
# Migratsiyani ishga tushirish
npx prisma migrate dev --name init

# Prisma client generatsiya
npx prisma generate
```

### 4. Serverni ishga tushirish

```bash
# Development (hot reload bilan)
npm run dev

# Production build
npm run build
npm start
```

Server: `http://localhost:5000`

---

## API Endpointlar

### Auth — `/api/auth`

| Method | URL | Himoya | Tavsif |
|---|---|---|---|
| POST | `/register` | — | Ro'yxatdan o'tish |
| POST | `/login` | — | Kirish |
| GET | `/me` | ✅ | Joriy foydalanuvchi |

**Register body:**
```json
{
  "phone": "+998901234567",
  "password": "123456",
  "fullName": "Ali Valiyev",
  "role": "PASSENGER"  // yoki "DRIVER"
}
```

**Login response:**
```json
{
  "token": "eyJ...",
  "user": { "id": "...", "phone": "...", "role": "PASSENGER" }
}
```

---

### Orders — `/api/orders`

| Method | URL | Rol | Tavsif |
|---|---|---|---|
| POST | `/` | PASSENGER | Buyurtma yaratish |
| GET | `/my` | Istalgan | O'z buyurtmalarim |
| GET | `/:id` | Istalgan | Buyurtma ma'lumoti |
| PATCH | `/:id/accept` | DRIVER | Qabul qilish |
| PATCH | `/:id/status` | DRIVER | Status yangilash |
| PATCH | `/:id/cancel` | Istalgan | Bekor qilish |

**Create order body:**
```json
{
  "pickupAddress": "Chilonzor 5-kvartal",
  "dropoffAddress": "Yunusobod 19-kvartal",
  "pickupLat": 41.2995,
  "pickupLng": 69.2401,
  "dropoffLat": 41.3456,
  "dropoffLng": 69.3012,
  "price": 25000
}
```

**Status options:** `ARRIVED`, `STARTED`, `COMPLETED`

---

### Drivers — `/api/drivers`

| Method | URL | Rol | Tavsif |
|---|---|---|---|
| GET | `/profile` | DRIVER | Profil ma'lumoti |
| GET | `/online` | Istalgan | Onlayn haydovchilar |
| POST | `/online` | DRIVER | Online bo'lish |
| POST | `/offline` | DRIVER | Offline bo'lish |
| PATCH | `/location` | DRIVER | Lokatsiya yangilash |

**Location body:**
```json
{ "latitude": 41.2995, "longitude": 69.2401 }
```

---

### Matching — `/api/matching`

| Method | URL | Tavsif |
|---|---|---|
| POST | `/nearest-driver` | Yaqin haydovchi topish |
| POST | `/estimate` | Narx va vaqt hisoblash |

**Nearest driver body:**
```json
{ "pickupLat": 41.2995, "pickupLng": 69.2401, "radiusKm": 5 }
```

**Estimate body:**
```json
{
  "pickupLat": 41.2995, "pickupLng": 69.2401,
  "dropoffLat": 41.3456, "dropoffLng": 69.3012
}
```

---

## Socket.IO Events

### Client → Server

| Event | Data | Tavsif |
|---|---|---|
| `join-driver` | `driverId` | Haydovchi xonasiga qo'shilish |
| `join-passenger` | `passengerId` | Yo'lovchi xonasiga qo'shilish |
| `driver-location` | `{driverId, passengerId?, latitude, longitude}` | Lokatsiya yuborish |
| `order-created` | `{orderId, pickupLat, pickupLng}` | Yangi buyurtma |
| `order-accepted` | `{orderId, passengerId, driver}` | Qabul qilindi |
| `order-status` | `{orderId, passengerId, status}` | Status o'zgardi |

### Server → Client

| Event | Tavsif |
|---|---|
| `driver-location` | Haydovchi lokatsiyasi (yo'lovchiga) |
| `order-created` | Yangi buyurtma (haydovchilarga) |
| `order-accepted` | Haydovchi topildi (yo'lovchiga) |
| `order-status` | Buyurtma holati (yo'lovchiga) |

---

## Database modellari

```
User: id, phone (unique), password, fullName, role (PASSENGER/DRIVER/ADMIN)
Driver: id, userId, online, latitude, longitude, rating
Order: id, passengerId, driverId, pickup/dropoff info, price, status
```

**Order statuslari:** `PENDING → SEARCHING → ACCEPTED → ARRIVED → STARTED → COMPLETED / CANCELLED`
