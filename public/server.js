"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./routes/index"));
const dotenv_1 = __importDefault(require("dotenv"));
const error_middleware_1 = __importDefault(require("./middleware/error.middleware"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const port = process.env.PORT || 3000;
dotenv_1.default.config({
    path: './.env'
});
app.use(express_1.default.json());
app.use(index_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.use(error_middleware_1.default);
app.listen(3000, () => {
    console.log(`Server started on port http://localhost:3000`);
});
