import { Request, Response } from "express";
import { findNearestDriver, estimatePrice } from "./matching.service";

export async function getNearestDriver(req: Request, res: Response) {
  try {
    const { pickupLat, pickupLng, radiusKm } = req.body;

    if (!pickupLat || !pickupLng) {
      return res.status(400).json({ message: "pickupLat va pickupLng majburiy" });
    }

    const driver = await findNearestDriver(Number(pickupLat), Number(pickupLng), radiusKm ? Number(radiusKm) : 10);

    if (!driver) {
      return res.status(404).json({ message: "Yaqin atrofda onlayn haydovchi topilmadi" });
    }

    return res.json(driver);
  } catch (error: any) {
    return res.status(500).json({ message: "Matching xatosi: " + error.message });
  }
}

export async function getPriceEstimate(req: Request, res: Response) {
  try {
    const { pickupLat, pickupLng, dropoffLat, dropoffLng } = req.body;

    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      return res.status(400).json({ message: "Barcha koordinatalar majburiy" });
    }

    const estimate = await estimatePrice(
      Number(pickupLat), Number(pickupLng),
      Number(dropoffLat), Number(dropoffLng)
    );

    return res.json(estimate);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
