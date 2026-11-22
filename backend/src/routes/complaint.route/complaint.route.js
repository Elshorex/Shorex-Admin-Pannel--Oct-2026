import express from 'express';

let router = express.Router();
import complaintController from "../../controllers/complaint.controller/complaint.controller.js";
import {requireAuth} from '../../services/passport.js';

router.route('/')
    .get(requireAuth,complaintController.findAll)
    .post(requireAuth,complaintController.validateBody(),complaintController.create)


router.route('/deleteMutliple').delete(requireAuth,complaintController.validateDeleteMulti(),complaintController.deleteMuti)
router.route('/visitor').post(complaintController.validateVisitor(),complaintController.createVisitorComplain)
router.route('/close/:id').put(requireAuth, complaintController.closeComplain)
router.route('/current-user-complain').get(requireAuth, complaintController.getCurrentUserComplain)
router.route('/current-visitor-complain').get( complaintController.getCurrentVisitorComplain)

router.route('/:id/changeStatus').put(requireAuth,complaintController.validateChangeStatus(),complaintController.changeStatus)
router.route('/:id')
    .get(requireAuth,complaintController.findById)
    .put(requireAuth,complaintController.validateBody(true),complaintController.update)
    .delete(requireAuth,complaintController.delete)

export default router;