import { Router } from "express";
import { createRoomRequest, getAllRoomRequests, searchRoomRequests, getUserRoomRequests, deleteRoomRequest, updateRoomRequest, getRoomRequestById } from "../controller.js/roomRequest.controller.js";
import authMiddleware from "../middlewares/auth.js";

const router = Router();

router.post("/", authMiddleware, createRoomRequest);
router.get("/all", getAllRoomRequests);
router.get("/search", authMiddleware, searchRoomRequests);
router.get("/user", authMiddleware, getUserRoomRequests);
router.get("/:id", authMiddleware, getRoomRequestById);
router.delete("/:id", authMiddleware, deleteRoomRequest);
router.put("/:id", authMiddleware, updateRoomRequest);

export default router;