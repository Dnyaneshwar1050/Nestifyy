// src/routers/subscription.routes.js
import { Router } from "express";
import authMiddleware from "../middlewares/auth.js";
import { getSubscriptionStatus, purchaseSubscription } from "../controller.js/subscription.controller.js";

const router = Router();

router.get('/status', authMiddleware, getSubscriptionStatus);
router.post('/purchase', authMiddleware, purchaseSubscription);

export default router;