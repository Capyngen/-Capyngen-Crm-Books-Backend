import { Router } from 'express';
import { upload } from '../core/middlewares/upload';
import { verifyCapyngenToken } from '../core/middlewares/hrmsAuth';

const router = Router();

router.post('/', verifyCapyngenToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // @ts-ignore
  const fileUrl = req.file.location; // S3 provides the URL in location
  res.json({ success: true, url: fileUrl });
});

export default router;
