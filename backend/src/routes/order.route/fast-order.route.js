import express from 'express';

let router = express.Router();
import createFastController from "../../controllers/order.controller/fast-order.js";
import { requireAuth } from '../../services/passport.js';
import { multerSaveTo } from '../../services/multer-service.js';

  

router.route('/').post(requireAuth, createFastController.validateBody(),createFastController.create)

router.route('/driver-add-offer/:id').put(requireAuth, createFastController.validateDriverAddOffer(),createFastController.driverAddOffer)
router.route('/driver-reject-offer/:id').put(requireAuth,createFastController.driverRejectOffer)

router.route('/user-cancel/:id').put(requireAuth,createFastController.canceled)
router.route('/user-confirm/:id').put(requireAuth,createFastController.userConfirmOrder)
router.route('/start-trip/:id').put(requireAuth,createFastController.startTrip)
router.route('/driver-call/:id').put(requireAuth,createFastController.call)
router.route('/create-invoice/:id').put(requireAuth,createFastController.validateCreateInvoice(),createFastController.createInvoice)
router.route('/add-invoice-image/:id').put(requireAuth,multerSaveTo('order').single('invoiceImage'),createFastController.addInvoiceImage)
router.route('/delivered/:id').put(requireAuth,createFastController.delivered)
router.route('/delivered-confirmed/:id').put(requireAuth,createFastController.deliveredConfirm)

router.route('/client-accept-offer/:id/:driverId').put(requireAuth,createFastController.userAcceptOffer)
router.route('/client-reject-offer/:id/:driverId').put(requireAuth,createFastController.userRejectOffer)

router.route('/:id').put(requireAuth, createFastController.validateBody(true), createFastController.update)




export default router;