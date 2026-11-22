import express from 'express';

let router = express.Router();
import categoryController from "../../controllers/admin-site-map.controller/admin-site-map.controller.js";
import { requireAuth } from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(categoryController.findAll)
    .post(requireAuth,
        
        categoryController.validateBody(), categoryController.create)

router.route('/deleteMutliple').delete(requireAuth,
    categoryController.validateDeleteMulti(),
    categoryController.deleteMuti
    )

router.route('/:adminSiteMapId')
    .get(categoryController.findById)
    .put(requireAuth,
        
        categoryController.validateBody(true),
        categoryController.update)
    .delete(requireAuth,checkDeleteAuth(), categoryController.delete)

export default router;