var express = require('express');
var router = express.Router();
import paymentController from "../../controllers/payment-transaction.controller/payment-transaction.controller.js";
import {requireAuth} from '../../services/passport.js';



router.route('/wallet').post( requireAuth , 
    paymentController.validateInitializeCreditCharge(),paymentController.initializeCreditCharge
    )

router.route('/wallet/:transactionId').get(requireAuth,paymentController.chargeTransactionInquiry)

//////////////////////////////////////////////////

router.route('/:transactionId').get( requireAuth , paymentController.findById)

router.route('/transaction-inquiry/:orderId/:transactionId')
.get( requireAuth , paymentController.paymentTransactionInquiry);



    

export default router;
