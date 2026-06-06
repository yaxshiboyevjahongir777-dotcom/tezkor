import { Request, Response } from "express";
import * as service from "./auth.service";

export async function register(req: Request, res: Response) {
  try {
    const { phone, password, fullName, role } = req.body;

    if (!phone || !password || !fullName) {
      return res.status(400).json({ message: "phone, password, fullName majburiy" });
    }

    const user = await service.register(phone, password, fullName, role);
    return res.status(201).json(user);
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "phone va password majburiy" });
    }

    const result = await service.login(phone, password);
    return res.json(result);
  } catch (e: any) {
    return res.status(401).json({ message: e.message });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const user = await service.me(req.user!.id);
    return res.json(user);
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
}
