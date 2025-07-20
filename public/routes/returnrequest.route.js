"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const returnrequest_controller_1 = require("../controller/returnrequest.controller");
const returnRequestRouter = (0, express_1.Router)();
returnRequestRouter.post("/createreturnrequest", returnrequest_controller_1.createReturnRequest);
returnRequestRouter.get("/getallreturnrequests", returnrequest_controller_1.getAllReturnRequests);
returnRequestRouter.get("/:id", returnrequest_controller_1.getReturnRequestbyId);
exports.default = returnRequestRouter;
