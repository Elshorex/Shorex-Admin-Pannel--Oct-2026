import express from 'express';

let router = express.Router();
import orderController from "../../controllers/order.controller/order.controller.js";
import createNormalController from "../../controllers/order.controller/normal-order.js";
import createBookingController from "../../controllers/order.controller/bookings.js";
import { requireAuth } from '../../services/passport.js';
import { multerSaveTo } from '../../services/multer-service.js';

///////////////////////////////////////////////////////////////////////////////////////////////////////
router.route('/traderSales').get(requireAuth, orderController.traderGetSales)
router.route('/driverSales').get(requireAuth, orderController.getDriverSales)
router.route('/driver-account-summery').get(requireAuth, orderController.getDriverSummery)

///////////////////////////////////////////////////////////////////////////////////////////////////////

router.route('/deleteMutliple').delete(requireAuth,orderController.validateDeleteMulti(),orderController.deleteMuti)


router.route('/resend-order').post(requireAuth, orderController.validateResendOrderToTrader(), orderController.resendOrderToTrader)
    
//////////////////////////////////////////Rate/////////////////////////////////////////////////////////
router.route('/trader-rates').get( orderController.getTraderRates)

router.route('/client-rate-trader').post(requireAuth,orderController.validateRate(), orderController.clientRateTrader)
router.route('/client-rate-driver').post(requireAuth,orderController.validateRate(), orderController.clientRateDriver)

router.route('/driver-rate-client').post(requireAuth,orderController.validateRate(), orderController.driverRateClient)
router.route('/driver-rate-trader').post(requireAuth,orderController.validateRate(), orderController.driverRateTrader)

router.route('/trader-rate-driver').post(requireAuth,orderController.validateRate(), orderController.traderRateDriver)

///////////////////////////////////////////////////////////////////////////////////////////////////////
router.route('/normal-order').post(requireAuth, createNormalController.validateBody(),createNormalController.create)
router.route('/booking').post(requireAuth, createBookingController.validateBody(),createBookingController.create)
router.route('/').get(requireAuth, orderController.findAll)
    

router.route('/:orderId/add-invoice').post(requireAuth, multerSaveTo('order').single('invoiceImage'), orderController.addInvoice )
router.route('/:orderId/accepteOrReject').put(requireAuth, orderController.validateAcceptOrReject(), orderController.acceptOrReject)
router.route('/:orderId/driverAccepteOrReject').put(requireAuth, orderController.validateDriverAcceptOrReject(), orderController.driverAcceptOrReject)
router.route('/:orderId/shipped').put(requireAuth, orderController.shipped)
router.route('/:orderId/delivered').put(requireAuth,orderController.validateDelivered(), orderController.delivered)
router.route('/:orderId/prepared').put(requireAuth, orderController.prepared)
router.route('/:orderId/client-canceled').put(requireAuth, orderController.clientCanceled)
router.route('/:orderId/tarder-canceled').put(requireAuth, orderController.validateTraderCancel(), orderController.traderCancel)
router.route('/:orderId/admin-canceled').put(requireAuth, orderController.validateAdminCancel(), orderController.adminCancel)

router.route('/:orderId/assign-driver').put(requireAuth, orderController.validateAssignToDriver(), orderController.assignToDriver)

router.route('/:orderId')
    .get(requireAuth, orderController.findById)
    .delete(requireAuth, orderController.delete)


export default router;