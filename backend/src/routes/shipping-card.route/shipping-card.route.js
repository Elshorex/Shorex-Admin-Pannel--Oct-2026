import express from 'express';

let router = express.Router();
import shippingCardController from "../../controllers/shipping-card.controller/shipping-card.controller.js";
import {requireAuth} from '../../services/passport.js';

router.route('/multiple').post(requireAuth,shippingCardController.validateMulti(),shippingCardController.createMulti)
router.route('/')
    .get(shippingCardController.findAll)
    .post(requireAuth,shippingCardController.validateBody(),shippingCardController.create)

router.route('/useCard').post(requireAuth,shippingCardController.validateUseCard(),shippingCardController.useCard)
router.route('/addedToWallet').post(requireAuth,shippingCardController.validateAdminAddToWallet(),shippingCardController.adminAddToWallet)
router.route('/deleteMutliple').delete(requireAuth,shippingCardController.validateDeleteMulti(),shippingCardController.deleteMuti)

router.route('/:shippingCardId')
    .get(requireAuth,shippingCardController.findById)
    .put(requireAuth,shippingCardController.validateBody(true),shippingCardController.update)
    .delete(requireAuth,shippingCardController.delete)

export default router;