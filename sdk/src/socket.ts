// Socket.IO client — React Native va Web uchun bir xil ishlaydi
// React Native: npm install socket.io-client
// React Web: npm install socket.io-client

import { io, Socket } from "socket.io-client";
import type { Driver, Order } from "./types";

let socket: Socket | null = null;
let SOCKET_URL = "http://localhost:5000";

export function configureSocket(url: string) {
  SOCKET_URL = url;
}

export function connectSocket(token?: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: token ? { token } : undefined,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket ulandi:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket uzildi:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket xatosi:", err.message);
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}

// ─── Passenger actions ────────────────────────────────────────────────────────

export const passengerSocket = {
  /** Yo'lovchi o'z xonasiga qo'shiladi — socket events kelishi uchun */
  join: (passengerId: string) => {
    socket?.emit("join-passenger", passengerId);
  },

  /** Haydovchi qabul qilganda */
  onOrderAccepted: (
    cb: (data: { orderId: string; passengerId: string; driver: Driver }) => void
  ) => {
    socket?.on("order-accepted", cb);
    return () => socket?.off("order-accepted", cb);
  },

  /** Haydovchi lokatsiyasi yangilanganda */
  onDriverLocation: (
    cb: (data: { driverId: string; latitude: number; longitude: number }) => void
  ) => {
    socket?.on("driver-location", cb);
    return () => socket?.off("driver-location", cb);
  },

  /** Buyurtma holati o'zgarganda */
  onOrderStatus: (
    cb: (data: { orderId: string; passengerId: string; status: string }) => void
  ) => {
    socket?.on("order-status", cb);
    return () => socket?.off("order-status", cb);
  },
};

// ─── Driver actions ───────────────────────────────────────────────────────────

export const driverSocket = {
  /** Haydovchi o'z xonasiga qo'shiladi */
  join: (driverId: string) => {
    socket?.emit("join-driver", driverId);
  },

  /** Lokatsiyani serverga yuborish */
  sendLocation: (data: {
    driverId: string;
    passengerId?: string;
    latitude: number;
    longitude: number;
  }) => {
    socket?.emit("driver-location", data);
  },

  /** Yangi buyurtma kelganda */
  onOrderCreated: (
    cb: (data: { orderId: string; pickupLat: number; pickupLng: number }) => void
  ) => {
    socket?.on("order-created", cb);
    return () => socket?.off("order-created", cb);
  },

  /** Buyurtma qabul qilinganda boshqa haydovchilarga xabar */
  emitOrderAccepted: (data: {
    orderId: string;
    passengerId: string;
    driver: Partial<Driver>;
  }) => {
    socket?.emit("order-accepted", data);
  },

  /** Status yangilash */
  emitOrderStatus: (data: {
    orderId: string;
    passengerId: string;
    status: string;
  }) => {
    socket?.emit("order-status", data);
  },
};
