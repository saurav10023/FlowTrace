import { Router } from "express";
import {
    login,
    logout,
    getMe,
    completeProfile,
    skipProfile,
    updateMe,
    getMyTransactions,
    getMyStats,
    refreshAccessToken,
} from "../controllers/user.controller.js";

import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

// ─── Public ───────────────────────────────────────────────

router.post("/login", login);
router.post("/me/refresh-token", refreshAccessToken);

// ─── Authenticated User ───────────────────────────────────

router.post("/logout", verifyjwt, logout);

router.get("/me", verifyjwt, getMe);

router.post("/me/complete-profile", verifyjwt, completeProfile);

router.post("/me/skip-profile", verifyjwt, skipProfile);

router.patch("/me", verifyjwt, updateMe);

router.get("/me/transactions", verifyjwt, getMyTransactions);

router.get("/me/stats", verifyjwt, getMyStats);

export default router;