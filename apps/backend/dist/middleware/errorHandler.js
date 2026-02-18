"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    const status = err?.status || err?.statusCode || 500;
    if (status >= 500) {
        console.error(err && err.stack ? err.stack : err);
    }
    else if (process.env.NODE_ENV !== 'production') {
        console.warn(`[${status}] ${req.method} ${req.path}: ${err?.message || err}`);
    }
    res.status(status).json({
        success: false,
        message: err?.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err?.stack })
    });
};
exports.default = errorHandler;
//# sourceMappingURL=errorHandler.js.map