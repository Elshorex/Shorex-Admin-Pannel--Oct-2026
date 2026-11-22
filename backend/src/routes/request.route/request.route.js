import express from 'express';

let router = express.Router();
import requestController from "../../controllers/request.controller/request.controller.js";
import { requireAuth } from '../../services/passport.js';
import { checkOwnership } from "../../helpers/CheckMethods.js";
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/').post(requireAuth,requestController.validateBody(),requestController.create)


router.route('/product-reward/:productId').get( requireAuth,  requestController.getProductCustomerPoints)
router.route('/available-status').get( requireAuth,  requestController.availableStatus)
router.route('/').get( requireAuth, checkOwnership(), requestController.findAll)
router.route('/inprogress/count').get( requireAuth,checkOwnership(), requestController.inprogressCount)
router.route('/deleteMutliple').delete(requireAuth,checkDeleteAuth(),requestController.validateDeleteMulti(),requestController.deleteMuti)


router.route('/cancel/:requestId').put(requireAuth,  requestController.cancel )
router.route('/on-the-way/:requestId').put(requireAuth,  requestController.onTheWay )
router.route('/delivered/:requestId').put(requireAuth,  requestController.delivered )
router.route('/completed/:requestId').put(requireAuth,  requestController.completed )

router.route('/bulk-delivered').put(requireAuth,  requestController.bulkDelivered )
router.route('/bulk-completed').put(requireAuth,  requestController.bulkCompleted )

router.route('/failed/:requestId').put(requireAuth,  requestController.failed )
router.route('/route').post(requireAuth, requestController.validateCreateRoute()  ,   requestController.routeCreate )

router.route('/:requestId').get(requireAuth, requestController.findById).put(requireAuth,requestController.validateBody(true),requestController.update).delete(requireAuth,checkDeleteAuth(), requestController.delete)








export default router;