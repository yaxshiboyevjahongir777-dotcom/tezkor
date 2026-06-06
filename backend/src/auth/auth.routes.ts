import { Router } from "express";
import * as controller from "./auth.controller";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", auth, controller.me);

export default router;
