"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const SECRET_KEY = env_1.default.JWT_SECRET;
const EXPIRES_IN = '30d';
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, SECRET_KEY || "", { expiresIn: EXPIRES_IN });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, SECRET_KEY || "");
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
