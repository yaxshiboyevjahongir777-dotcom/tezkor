# TezGo — To'liq Loyiha

## Tuzilma

```
tezgo-full/
├── backend/     ← Express + Prisma + Socket.IO server
└── sdk/         ← Shared TypeScript SDK (React Native + Web)
```

## Ishga tushirish

### Backend
```bash
cd backend
npm install
cp .env.example .env   # .env ichida DATABASE_URL ni to'ldiring
npx prisma migrate dev
npm run dev            # http://localhost:5000
```

### SDK (React Web)
```bash
# sdk/web-demo/App.tsx ni React loyihangizga ko'chiring
# sdk/src/ papkasini ham loyihangizga qo'shing
```

### SDK (React Native)
```bash
cd your-rn-project
npm install @react-native-async-storage/async-storage socket.io-client
# sdk/src/ papkasini loyihangizga ko'chiring
# sdk/REACT_NATIVE_GUIDE.md ga qarang
```
