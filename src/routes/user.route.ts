import { Router } from "express";
import { createUser, loginUser, logoutUser } from "../controller/authUser.controller";

const userRouter = Router();

userRouter.post("/createuser", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);

export default userRouter;