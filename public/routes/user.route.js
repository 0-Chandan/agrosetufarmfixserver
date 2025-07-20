"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authUser_controller_1 = require("../controller/authUser.controller");
const userRouter = (0, express_1.Router)();
userRouter.post("/createuser", authUser_controller_1.createUser);
userRouter.post("/login", authUser_controller_1.loginUser);
exports.default = userRouter;
