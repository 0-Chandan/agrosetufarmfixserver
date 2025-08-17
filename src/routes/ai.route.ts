import { Router } from "express";
import { upload } from "../middleware/upload";
import { getImageResponse, getTextResponse } from "../controller/ai.controller";

const aiRouter = Router();

aiRouter.post("/analyze-image", upload.single("image"), getImageResponse)
aiRouter.post("/analyze-prompt", getTextResponse)

export default aiRouter