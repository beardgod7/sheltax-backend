import { Router } from 'express';
import { uploadImages } from '../controllers/upload.controller';

const router = Router();

router.post('/', uploadImages);

export default router;
