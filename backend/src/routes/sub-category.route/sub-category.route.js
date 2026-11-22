import express from 'express';

let router = express.Router();
import subcategoryController from "../../controllers/sub-category.controller/sub-category.controller.js";
import {requireAuth} from '../../services/passport.js';
import {multerSaveTo} from '../../services/multer-service.js';
import {parseObject} from '../../controllers/shared.controller/shared.controller.js';

router.route('/')
    .get(subcategoryController.findAll)
    .post(requireAuth,
        multerSaveTo('category').single('image'),
        parseObject(['name']),
        subcategoryController.validateBody(),
        subcategoryController.create)


router.route('/:subcategoryId')
    .get(subcategoryController.findById)
    .put(requireAuth,
        multerSaveTo('category').single('image'),
        parseObject(['name']),
        subcategoryController.validateBody(true),
        subcategoryController.update)
    .delete(requireAuth,subcategoryController.delete)

export default router;