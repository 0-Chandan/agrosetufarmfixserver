"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileToBase64 = fileToBase64;
const fs_1 = __importDefault(require("fs"));
function fileToBase64(filePath) {
    const imageBuffer = fs_1.default.readFileSync(filePath);
    return imageBuffer.toString("base64");
}
