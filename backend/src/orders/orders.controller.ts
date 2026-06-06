import { Request, Response } from "express";
import * as service from "./orders.service";

export async function createOrder(req: Request, res: Response) {
  try {
    const { pickupAddress, dropoffAddress, pickupLat, pickupLng, dropoffLat, dropoffLng, price, distanceKm, durationMin } = req.body;

    if (!pickupAddress || !dropoffAddress || !pickupLat || !pickupLng || !dropoffLat || !dropoffLng || !price) {
      return res.status(400).json({ message: "Barcha maydonlar to'ldirilishi shart" });
    }

    const order = await service.create({
      passengerId: req.user!.id,
      pickupAddress, dropoffAddress,
      pickupLat: Number(pickupLat), pickupLng: Number(pickupLng),
      dropoffLat: Number(dropoffLat), dropoffLng: Number(dropoffLng),
      price: Number(price),
      distanceKm: distanceKm ? Number(distanceKm) : undefined,
      durationMin: durationMin ? Number(durationMin) : undefined
    });

    return res.status(201).json(order);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getOrder(req: Request, res: Response) {
  try {
    const order = await service.get(req.params.id);
    if (!order) return res.status(404).json({ message: "Buyurtma topilmadi" });
    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getMyOrders(req: Request, res: Response) {
  try {
    const orders = await service.getMyOrders(req.user!.id);
    return res.json(orders);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function acceptOrder(req: Request, res: Response) {
  try {
    const order = await service.accept(req.params.id, req.user!.id);
    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { status } = req.body;
    const allowed = ["ARRIVED", "STARTED", "COMPLETED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Noto'g'ri status" });
    }
    const order = await service.updateStatus(req.params.id, status);
    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function cancelOrder(req: Request, res: Response) {
  try {
    const order = await service.cancel(req.params.id);
    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
