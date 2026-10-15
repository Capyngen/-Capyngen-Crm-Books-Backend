import express from 'express';
import { 
    getDocuments, 
    createDocument, 
    updateDocument, 
    deleteDocument 
} from '../controllers/documentController';

const router = express.Router();

router.route('/')
    .get(getDocuments)
    .post(createDocument);

router.route('/:id')
    .put(updateDocument)
    .delete(deleteDocument);

export default router;
