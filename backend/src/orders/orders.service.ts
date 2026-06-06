import { prisma } from "../prisma/client";

export async function create(data: {
  passengerId: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  price: number;
  distanceKm?: number;
  durationMin?: number;
}) {
  return prisma.order.create({
    data: {
      passengerId: data.passengerId,
      pickupAddress: data.pickupAddress,
      dropoffAddress: data.dropoffAddress,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      dropoffLat: data.dropoffLat,
      dropoffLng: data.dropoffLng,
      price: data.price,
      distanceKm: data.distanceKm,
      durationMin: data.durationMin,
      status: "PENDING"
    },
    include: { passenger: { select: { id: true, fullName: true, phone: true } } }
  });
}

export async function get(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      passenger: { select: { id: true, fullName: true, phone: true } },
      driver: { include: { user: { select: { fullName: true, phone: true } } } }
    }
  });
}

export async function getMyOrders(passengerId: string) {
  return prisma.order.findMany({
    where: { passengerId },
    orderBy: { createdAt: "desc" },
    include: { driver: { include: { user: { select: { fullName: true } } } } }
  });
}

export async function accept(orderId: string, driverId: string) {
  // Driver ID = Driver.id (not userId)
  const driver = await prisma.driver.findFirst({ where: { userId: driverId } });
  if (!driver) throw new Error("Haydovchi profili topilmadi");

  return prisma.order.update({
    where: { id: orderId },
    data: { driverId: driver.id, status: "ACCEPTED" },
    include: {
      passenger: { select: { id: true, fullName: true, phone: true } }
    }
  });
}

export async function updateStatus(orderId: string, status: "ARRIVED" | "STARTED" | "COMPLETED") {
  return prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
}

export async function cancel(id: string) {
  return prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" }
  });
}
