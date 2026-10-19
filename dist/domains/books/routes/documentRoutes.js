"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const documentController_1 = require("../controllers/documentController");
const router = express_1.default.Router();
router.route('/')
    .get(documentController_1.getDocuments)
    .post(documentController_1.createDocument);
router.route('/:id')
    .put(documentController_1.updateDocument)
    .delete(documentController_1.deleteDocument);
exports.default = router;
