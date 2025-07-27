"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const ai_controller_1 = require("../controller/ai.controller");
const aiRouter = (0, express_1.Router)();
aiRouter.post("/analyze-image", upload_1.upload.single("image"), ai_controller_1.getImageResponse);
aiRouter.post("/analyze-prompt", upload_1.upload.single("image"), ai_controller_1.getTextResponse);
exports.default = aiRouter;
