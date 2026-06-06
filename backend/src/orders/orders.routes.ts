import { Router } from "express";
import { auth, requireRole } from "../middleware/auth";
import { createOrder, getOrder, getMyOrders, acceptOrder, updateOrderStatus, cancelOrder } from "./orders.controller";

const router = Router();

router.post("/", auth, requireRole("PASSENGER"), createOrder);
router.get("/my", auth, getMyOrders);
router.get("/:id", auth, getOrder);
router.patch("/:id/accept", auth, requireRole("DRIVER"), acceptOrder);
router.patch("/:id/status", auth, requireRole("DRIVER"), updateOrderStatus);
router.patch("/:id/cancel", auth, cancelOrder);

export default router;
