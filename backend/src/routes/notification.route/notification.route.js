import express from 'express';

let router = express.Router();
import notificationController from "../../controllers/notification.controller/notification.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/').get(requireAuth,notificationController.findAll).post(requireAuth,notificationController.validateBody(),notificationController.create)
router.route('/mark-all-read').put(requireAuth,notificationController.markAllAsRead)
router.route('/:notificationId').get(requireAuth,notificationController.findById).put(requireAuth,notificationController.validateBody(true),notificationController.update).delete(requireAuth,checkDeleteAuth(),notificationController.delete)

export default router;