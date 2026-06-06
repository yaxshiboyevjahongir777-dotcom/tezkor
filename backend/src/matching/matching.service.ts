import { prisma } from "../prisma/client";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function findNearestDriver(pickupLat: number, pickupLng: number, radiusKm: number = 10) {
  const drivers = await prisma.driver.findMany({
    where: {
      online: true,
      latitude: { not: null },
      longitude: { not: null }
    },
    include: { user: { select: { fullName: true, phone: true } } }
  });

  if (!drivers.length) return null;

  const withDistance = drivers
    .map((d) => ({
      ...d,
      distanceKm: haversineDistance(pickupLat, pickupLng, d.latitude!, d.longitude!)
    }))
    .filter((d) => d.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return withDistance[0] || null;
}

export async function estimatePrice(pickupLat: number, pickupLng: number, dropoffLat: number, dropoffLng: number) {
  const distanceKm = haversineDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
  const BASE_PRICE = 5000; // so'm
  const PRICE_PER_KM = 2000;
  const price = Math.round(BASE_PRICE + distanceKm * PRICE_PER_KM);
  const durationMin = Math.round(distanceKm * 2.5); // taxminiy

  return { distanceKm: Math.round(distanceKm * 10) / 10, durationMin, price };
}
