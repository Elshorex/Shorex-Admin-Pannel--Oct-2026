import express from 'express';

let router = express.Router();
import productController from "../../controllers/product.controller/product.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(productController.findAll)
    .post(requireAuth,
        productController.validateBody(),productController.create)


router.route('/:productId')
    .get(requireAuth,productController.findById)
    .put(
        requireAuth,
        
        productController.validateBody(true),
        productController.update
        )
    .delete(requireAuth,checkDeleteAuth(),productController.delete)

export default router;