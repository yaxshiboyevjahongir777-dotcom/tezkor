import { Router } from "express";
import { auth, requireRole } from "../middleware/auth";
import { getProfile, goOnline, goOffline, updateLocation, getOnlineDrivers } from "./drivers.controller";

const router = Router();

router.get("/profile", auth, requireRole("DRIVER"), getProfile);
router.get("/online", auth, getOnlineDrivers);
router.post("/online", auth, requireRole("DRIVER"), goOnline);
router.post("/offline", auth, requireRole("DRIVER"), goOffline);
router.patch("/location", auth, requireRole("DRIVER"), updateLocation);

export default router;
