import { Router } from "express";
import { createOfficer, getAllOffcer, getOfficerById, updateOfficer, deleteOfficer } from "../controller/officer.controller";
import { upload } from "../middleware/upload";

const officerRouter = Router();

officerRouter.post("/create", upload.single("profileImage"), createOfficer);
officerRouter.get("/all", getAllOffcer);
officerRouter.get("/:id", getOfficerById);
officerRouter.put("/:id", upload.single("profileImage"), updateOfficer);
officerRouter.delete("/:id", deleteOfficer);

export default officerRouter;