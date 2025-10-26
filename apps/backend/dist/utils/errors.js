"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.CustomError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = void 0;
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 404;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 401;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 403;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ForbiddenError = ForbiddenError;
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
exports.AppError = CustomError;
//# sourceMappingURL=errors.js.map