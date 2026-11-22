import express from 'express';

let router = express.Router();
import rewardedProductsController from "../../controllers/rewarded-product.controller/rewarded-product.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(rewardedProductsController.findAll)
    .post(requireAuth,
        rewardedProductsController.validateBody(),rewardedProductsController.create)


router.route('/:productId')
    .get(requireAuth,rewardedProductsController.findById)
    .put(
        requireAuth,
        rewardedProductsController.validateBody(true),
        rewardedProductsController.update
        )
    .delete(requireAuth,checkDeleteAuth(),rewardedProductsController.delete)

export default router;