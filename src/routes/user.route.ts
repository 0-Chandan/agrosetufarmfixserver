import { Router } from "express";
import { createUser, loginUser } from "../controller/authUser.controller";

const userRouter = Router();

userRouter.post("/createuser", createUser);
userRouter.post("/login", loginUser);

export default userRouter;