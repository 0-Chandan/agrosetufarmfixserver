import e, { Router } from "express";
import { createReturnRequest , getAllReturnRequests , getReturnRequestbyId  } from "../controller/returnrequest.controller";

const returnRequestRouter = Router();

returnRequestRouter.post("/createreturnrequest", createReturnRequest);
returnRequestRouter.get("/getallreturnrequests", getAllReturnRequests);
returnRequestRouter.get("/:id", getReturnRequestbyId);

export default returnRequestRouter;

