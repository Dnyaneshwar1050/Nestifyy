import { Router } from "express";
import { registerUser, loginUser, updateUserProfile, deleteUser, updateUser, getUserProfile, getUserById, getAllUsers } from "../controller.js/user.controller.js";
import authMiddleware from "../middlewares/auth.js"
import upload from "../middlewares/multer.middleware.js"


const router = Router()

router.post('/register', upload.single('photo'), registerUser);
router.post('/login', loginUser);

// Profile routes
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, upload.single('photo'), updateUserProfile);

// Admin user management routes
router.get('/all', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);


export default router