import { Router } from "express";
import { createproperty, updateProperty, deleteProperty, getPropertyById, getAllProperties, searchProperties, getMyProperties } from "../controller.js/property.controller.js";
import authMiddleware from "../middlewares/auth.js"; 
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// Add authMiddleware to ensure only authenticated users can create properties
router.post('/register', authMiddleware, upload.array('image', 10), createproperty);
router.put('/:id', authMiddleware, upload.array('image', 10), updateProperty);
router.delete('/:id', authMiddleware, deleteProperty);
router.get('/all', getAllProperties);
router.get('/my-properties', authMiddleware, getMyProperties);
router.get('/:id', getPropertyById);
router.get('/search', searchProperties);

export default router;