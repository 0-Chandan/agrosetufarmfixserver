"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodError = void 0;
const zodError = (error) => {
    let errors = {};
    error.errors.map((issue) => {
        var _a;
        const path = (_a = issue.path) === null || _a === void 0 ? void 0 : _a[0];
        if (path)
            errors[path] = issue.message;
    });
    return errors;
};
exports.zodError = zodError;
