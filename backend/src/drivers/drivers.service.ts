import { prisma } from "../prisma/client";

export async function getProfile(userId: string) {
  return prisma.driver.findUnique({
    where: { userId },
    include: { user: { select: { fullName: true, phone: true } } }
  });
}

export async function online(userId: string) {
  return prisma.driver.update({
    where: { userId },
    data: { online: true }
  });
}

export async function offline(userId: string) {
  return prisma.driver.update({
    where: { userId },
    data: { online: false, latitude: null, longitude: null }
  });
}

export async function updateLocation(userId: string, latitude: number, longitude: number) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new Error("Latitude va longitude raqam bo'lishi kerak");
  }

  return prisma.driver.update({
    where: { userId },
    data: { latitude, longitude }
  });
}

export async function getOnlineDrivers() {
  return prisma.driver.findMany({
    where: { online: true, latitude: { not: null }, longitude: { not: null } },
    include: { user: { select: { fullName: true } } }
  });
}
