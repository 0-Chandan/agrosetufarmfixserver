"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authAdmin_controller_1 = require("../controller/authAdmin.controller");
const authAdmin_controller_2 = require("../controller/authAdmin.controller");
const express_1 = require("express");
const adminRouter = (0, express_1.Router)();
adminRouter.post("/createadmin", authAdmin_controller_1.createAdmin);
adminRouter.post("/login", authAdmin_controller_2.loginAdmin);
exports.default = adminRouter;
