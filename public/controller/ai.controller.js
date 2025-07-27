"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextResponse = exports.getImageResponse = void 0;
const generative_ai_1 = require("@google/generative-ai");
const error_middleware_1 = require("../middleware/error.middleware");
const env_1 = __importDefault(require("../config/env"));
const genAI = new generative_ai_1.GoogleGenerativeAI(env_1.default.GEMINI_API_KEY);
exports.getImageResponse = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded.' });
    }
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
    });
    const base64Image = req.file.buffer.toString("base64");
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: req.file.mimetype,
        },
    };
    const result = yield model.generateContentStream([
        {
            text: `आप एक कृषि विशेषज्ञ हैं। आपकी ज़िम्मेदारी कृषि संबंधित चित्रों का विश्लेषण करना है, विशेष रूप से फसलों का।

- यदि चित्र में कोई फसल है:
  - बताएं कि फसल स्वस्थ है या नहीं।
  - यदि फसल में कोई समस्या है, तो सुधार के लिए सुझाव दें।
- यदि चित्र कृषि से संबंधित नहीं है:
  - केवल यह उत्तर दें: "मैं केवल कृषि से संबंधित छवियों का विश्लेषण करने में विशेषज्ञ हूँ।"

कृपया सभी उत्तर केवल हिंदी भाषा में दें।`
        },
        imagePart,
        { text: "कृपया इस छवि का विश्लेषण करें।" }
    ]);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    try {
        for (var _d = true, _e = __asyncValues(result.stream), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
            _c = _f.value;
            _d = false;
            const chunk = _c;
            const text = chunk.text();
            process.stdout.write(text); // log to server
            res.write(text); // stream to client
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
        }
        finally { if (e_1) throw e_1.error; }
    }
    res.end(); // End response after streaming
}));
exports.getTextResponse = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_2, _b, _c;
    var _d;
    const prompt = (_d = req.body) === null || _d === void 0 ? void 0 : _d.prompt;
    if (!prompt) {
        return res.status(400).json({ error: 'Missing text prompt.' });
    }
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
    });
    const result = yield model.generateContentStream([
        {
            text: `आप एक कृषि विशेषज्ञ हैं। आपकी ज़िम्मेदारी कृषि से संबंधित किसी भी प्रश्न का उत्तर देना है।

- यदि प्रश्न फसल, मिट्टी, उर्वरक, या कृषि समस्या से संबंधित है:
  - विस्तृत जानकारी दें।
  - सुझाव या समाधान प्रदान करें।
- यदि प्रश्न कृषि से संबंधित नहीं है:
  - केवल यह उत्तर दें: "मैं केवल कृषि से संबंधित विषयों में विशेषज्ञ हूँ।"

कृपया सभी उत्तर केवल हिंदी भाषा में दें।`
        },
        {
            text: prompt
        }
    ]);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    try {
        for (var _e = true, _f = __asyncValues(result.stream), _g; _g = yield _f.next(), _a = _g.done, !_a; _e = true) {
            _c = _g.value;
            _e = false;
            const chunk = _c;
            const text = chunk.text();
            process.stdout.write(text); // log to server
            res.write(text); // stream to client
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (!_e && !_a && (_b = _f.return)) yield _b.call(_f);
        }
        finally { if (e_2) throw e_2.error; }
    }
    res.end(); // End response after streaming
}));
