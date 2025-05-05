import express from "express";
import { getUserData, updateUserProfile } from "../Controllers/userController.js";
import userAuth from "../middleware/userAuth.js";
import upload from "../config/multerConfig.js";


const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.put('/profile',userAuth, upload.single('profileImage'), updateUserProfile);
export default userRouter