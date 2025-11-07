"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequest = exports.getRequests = exports.submitRequest = void 0;
const service = __importStar(require("./permintaanPerubahanData.service"));
const submitRequest = async (req, res, next) => {
    try {
        const { requestedChanges } = req.body;
        const employeeId = req.user.employeeId;
        const newRequestId = await service.createChangeRequest({ employeeId, requestedChanges });
        res.status(201).json({ message: 'Request submitted successfully', id: newRequestId });
    }
    catch (error) {
        next(error);
    }
};
exports.submitRequest = submitRequest;
const getRequests = async (req, res, next) => {
    try {
        const requests = await service.getAllChangeRequests();
        res.json(requests);
    }
    catch (error) {
        next(error);
    }
};
exports.getRequests = getRequests;
const handleRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, reviewNotes } = req.body;
        const reviewedBy = req.user.id;
        await service.processChangeRequest(Number(id), status, reviewedBy, reviewNotes);
        res.status(200).json({ message: `Request ${status} successfully` });
    }
    catch (error) {
        next(error);
    }
};
exports.handleRequest = handleRequest;
//# sourceMappingURL=permintaanPerubahanData.controller.js.map