export declare class NotFoundError extends Error {
    statusCode: number;
    constructor(message: string);
}
export declare class ValidationError extends Error {
    statusCode: number;
    constructor(message: string);
}
export declare class UnauthorizedError extends Error {
    statusCode: number;
    constructor(message: string);
}
export declare class ForbiddenError extends Error {
    statusCode: number;
    constructor(message: string);
}
export declare class CustomError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number);
}
export { CustomError as AppError };
//# sourceMappingURL=errors.d.ts.map