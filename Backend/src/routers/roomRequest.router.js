import { Router } from "express";
import { createRoomRequest, getAllRoomRequests, searchRoomRequests, getUserRoomRequests, deleteRoomRequest } from "../controller.js/roomRequest.controller.js";
import authMiddleware from "../middlewares/auth.js";

const router = Router();

router.post("/", authMiddleware, createRoomRequest);
router.get("/", getAllRoomRequests);
router.get("/search", authMiddleware, searchRoomRequests);
router.get("/user", authMiddleware, getUserRoomRequests);
router.delete("/:id", authMiddleware, deleteRoomRequest);

export default router;