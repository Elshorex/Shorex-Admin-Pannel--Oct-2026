import express from 'express';

let router = express.Router();
import requestController from "../../controllers/claim-request.controller/claim-request.controller.js";
import { requireAuth } from '../../services/passport.js';
import { checkOwnership } from "../../helpers/CheckMethods.js";
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/').post(requireAuth,requestController.validateBody(),requestController.create)

router.route('/').get( requireAuth, checkOwnership(), requestController.findAll)
router.route('/count').get( requireAuth,checkOwnership(), requestController.claimCount)
router.route('/deleteMutliple').delete(requireAuth,checkDeleteAuth(),requestController.validateDeleteMulti(),requestController.deleteMuti)

router.route('/available-status').get( requireAuth,  requestController.availableStatus)

router.route('/cancel/:claimRequestId').put(requireAuth,  requestController.cancel )
router.route('/accept/:claimRequestId').put(requireAuth,  requestController.accept )
router.route('/reject/:claimRequestId').put(requireAuth,  requestController.reject )

router.route('/:claimRequestId')
    .get(requireAuth, requestController.findById)
    .put(requireAuth,  requestController.validateBody(true),requestController.update)
    .delete(requireAuth,checkDeleteAuth(), requestController.delete)







   
export default router;