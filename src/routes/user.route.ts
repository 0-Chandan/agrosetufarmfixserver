import { Router } from "express";
import { createUser, getAllUsers, getuserbyid, loginUser, logoutUser, updateUser } from "../controller/authUser.controller";
import { Authnticateuser } from "../middleware/authmiddleware";


const userRouter = Router();

userRouter.post("/createuser", createUser);
userRouter.get("/getall", getAllUsers);
userRouter.get("/getbyid" , Authnticateuser , getuserbyid);
userRouter.put("/update",Authnticateuser, updateUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);

export default userRouter;