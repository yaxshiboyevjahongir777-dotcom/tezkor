import { Router } from "express";
import { auth } from "../middleware/auth";
import { getNearestDriver, getPriceEstimate } from "./matching.controller";

const router = Router();

router.post("/nearest-driver", auth, getNearestDriver);
router.post("/estimate", auth, getPriceEstimate);

export default router;
