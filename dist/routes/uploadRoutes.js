"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../core/middlewares/upload");
const hrmsAuth_1 = require("../core/middlewares/hrmsAuth");
const router = (0, express_1.Router)();
router.post('/', hrmsAuth_1.verifyCapyngenToken, upload_1.upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // @ts-ignore
    const fileUrl = req.file.location; // S3 provides the URL in location
    res.json({ success: true, url: fileUrl });
});
exports.default = router;
