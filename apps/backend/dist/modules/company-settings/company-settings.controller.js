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
exports.updateSettings = exports.getSettings = void 0;
const service = __importStar(require("./company-settings.service"));
const getSettings = async (req, res, next) => {
    try {
        const settings = await service.getSettings();
        res.json(settings);
    }
    catch (error) {
        next(error);
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res, next) => {
    try {
        const settingsData = req.body;
        if (req.file) {
            settingsData.logo = `/logos/${req.file.filename}`;
        }
        else if (settingsData.logo && settingsData.logo.includes('http')) {
            try {
                const url = new URL(settingsData.logo);
                settingsData.logo = url.pathname;
            }
            catch (e) {
                console.error('Invalid URL for logo, skipping modification:', settingsData.logo);
            }
        }
        await service.updateSettings(settingsData);
        res.sendStatus(200);
    }
    catch (error) {
        next(error);
    }
};
exports.updateSettings = updateSettings;
//# sourceMappingURL=company-settings.controller.js.map