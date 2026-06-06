# React Native bilan ulash

## 1. Kutubxonalarni o'rnating

```bash
npm install @react-native-async-storage/async-storage socket.io-client
```

## 2. App.tsx da SDK ni ishga tushiring

```tsx
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initTezgo, storage } from "../tezgo-sdk/src";

export default function App() {
  useEffect(() => {
    // AsyncStorage ni ulash (React Native uchun)
    storage.setup(AsyncStorage);

    // SDK ni ishga tushirish
    initTezgo({
      apiUrl: "http://YOUR_COMPUTER_IP:5000/api",
      // Emulator: 10.0.2.2:5000 (Android)
      // Haqiqiy qurilma: kompyutingiz IP manzili
    });
  }, []);

  return <YourNavigator />;
}
```

## 3. Login ekrani

```tsx
import { authApi, setToken, storage, STORAGE_KEYS } from "../tezgo-sdk/src";

async function handleLogin(phone: string, password: string) {
  try {
    const result = await authApi.login(phone, password);

    // Tokenni saqlash
    await storage.set(STORAGE_KEYS.TOKEN, result.token);
    await storage.setJson(STORAGE_KEYS.USER, result.user);

    // Rolga qarab navigate qilish
    if (result.user.role === "DRIVER") {
      navigation.navigate("DriverHome");
    } else {
      navigation.navigate("PassengerHome");
    }
  } catch (e: any) {
    Alert.alert("Xato", e.message);
  }
}
```

## 4. Buyurtma yaratish (Yo'lovchi)

```tsx
import { matchingApi, ordersApi } from "../tezgo-sdk/src";

// 1. Narx hisoblash
const estimate = await matchingApi.estimatePrice(
  currentLat, currentLng,
  destinationLat, destinationLng
);

// 2. Buyurtma berish
const order = await ordersApi.create({
  pickupAddress: "Chilonzor 5-kvartal",
  dropoffAddress: "Yunusobod 19-kvartal",
  pickupLat: currentLat,
  pickupLng: currentLng,
  dropoffLat: destinationLat,
  dropoffLng: destinationLng,
  price: estimate.price,
  distanceKm: estimate.distanceKm,
  durationMin: estimate.durationMin,
});
```

## 5. Real-time lokatsiya (Haydovchi)

```tsx
import { connectSocket, driverSocket, getToken } from "../tezgo-sdk/src";
import * as Location from "expo-location";

useEffect(() => {
  const socket = connectSocket(getToken() || undefined);
  driverSocket.join(userId);

  // Har 5 soniyada lokatsiya yuborish
  const interval = setInterval(async () => {
    const loc = await Location.getCurrentPositionAsync({});
    driverSocket.sendLocation({
      driverId: userId,
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  }, 5000);

  return () => {
    clearInterval(interval);
  };
}, []);
```

## 6. Real-time buyurtma kuzatish (Yo'lovchi)

```tsx
import { connectSocket, passengerSocket, getToken } from "../tezgo-sdk/src";

useEffect(() => {
  const socket = connectSocket(getToken() || undefined);
  passengerSocket.join(userId);

  const unsub1 = passengerSocket.onOrderAccepted((data) => {
    Alert.alert("Haydovchi topildi!", `${data.driver.user?.fullName} yo'lda`);
  });

  const unsub2 = passengerSocket.onDriverLocation((data) => {
    // Xaritada haydovchi markerini yangilash
    setDriverLocation({ lat: data.latitude, lng: data.longitude });
  });

  const unsub3 = passengerSocket.onOrderStatus((data) => {
    setOrderStatus(data.status);
  });

  return () => { unsub1(); unsub2(); unsub3(); };
}, []);
```

## IP manzil (muhim!)

Backend localhost'da ishlayotganda:

| Muhit | URL |
|---|---|
| Android Emulator | `http://10.0.2.2:5000/api` |
| iOS Simulator | `http://localhost:5000/api` |
| Haqiqiy telefon | `http://192.168.X.X:5000/api` (WiFi IP) |

WiFi IP'ingizni topish:
- Windows: `ipconfig` → "IPv4 Address"
- Mac/Linux: `ifconfig` → `en0` → `inet`
