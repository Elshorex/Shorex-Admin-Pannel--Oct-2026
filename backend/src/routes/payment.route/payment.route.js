import express from 'express';

let router = express.Router();
import paymentController from "../../controllers/payment.controller/payment.controller.js"
import {requireAuth} from '../../services/passport.js';

///// wallet credit 


router.route('/checkoutId')
    .post(requireAuth,paymentController.validateGetCheckoutId(),paymentController.getCreditCheckoutId)

router.route('/status')
    .post(requireAuth,paymentController.validateGetPaymentStatus(),paymentController.getPaymentStatus)
    

//////////////////////////////////

router.route('/:id')
    .post(requireAuth,paymentController.findById)



router.route('/notify').get(paymentController.notification);

router.route('/refund-credit').post(requireAuth,paymentController.validateRefund() , paymentController.refundCreditPayment )

export default router;