import { Server, Socket } from "socket.io";
import http from "http";

export function initSocket(server: http.Server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket: Socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // Haydovchi o'z xonasiga qo'shiladi
    socket.on("join-driver", (driverId: string) => {
      socket.join(`driver:${driverId}`);
      console.log(`Driver ${driverId} joined room`);
    });

    // Yo'lovchi o'z xonasiga qo'shiladi
    socket.on("join-passenger", (passengerId: string) => {
      socket.join(`passenger:${passengerId}`);
      console.log(`Passenger ${passengerId} joined room`);
    });

    // Haydovchi lokatsiyasi — faqat tegishli yo'lovchiga yuboriladi
    socket.on("driver-location", (data: { driverId: string; passengerId?: string; latitude: number; longitude: number }) => {
      if (data.passengerId) {
        io.to(`passenger:${data.passengerId}`).emit("driver-location", data);
      } else {
        socket.broadcast.emit("driver-location", data);
      }
    });

    // Yangi buyurtma — barcha onlayn haydovchilarga
    socket.on("order-created", (data: { orderId: string; pickupLat: number; pickupLng: number }) => {
      socket.broadcast.emit("order-created", data);
    });

    // Buyurtma qabul qilindi — faqat yo'lovchiga
    socket.on("order-accepted", (data: { orderId: string; passengerId: string; driver: object }) => {
      io.to(`passenger:${data.passengerId}`).emit("order-accepted", data);
    });

    // Buyurtma holati o'zgardi
    socket.on("order-status", (data: { orderId: string; passengerId: string; status: string }) => {
      io.to(`passenger:${data.passengerId}`).emit("order-status", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
}
