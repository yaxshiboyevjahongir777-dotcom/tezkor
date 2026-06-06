import { Request, Response } from "express";
import * as service from "./drivers.service";

export async function getProfile(req: Request, res: Response) {
  try {
    const driver = await service.getProfile(req.user!.id);
    if (!driver) return res.status(404).json({ message: "Haydovchi profili topilmadi" });
    return res.json(driver);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function goOnline(req: Request, res: Response) {
  try {
    const driver = await service.online(req.user!.id);
    return res.json({ message: "Online", driver });
  } catch (error: any) {
    return res.status(500).json({ message: "Online bo'lmadi: " + error.message });
  }
}

export async function goOffline(req: Request, res: Response) {
  try {
    const driver = await service.offline(req.user!.id);
    return res.json({ message: "Offline", driver });
  } catch (error: any) {
    return res.status(500).json({ message: "Offline bo'lmadi: " + error.message });
  }
}

export async function updateLocation(req: Request, res: Response) {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "latitude va longitude majburiy" });
    }

    const driver = await service.updateLocation(req.user!.id, Number(latitude), Number(longitude));
    return res.json(driver);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getOnlineDrivers(req: Request, res: Response) {
  try {
    const drivers = await service.getOnlineDrivers();
    return res.json(drivers);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
