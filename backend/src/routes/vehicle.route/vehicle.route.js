import express from 'express';
const router = express.Router();
import vehicleController from "../../controllers/vehicle.controller/vehicle.controller.js";
import { checkOwnership } from "../../helpers/CheckMethods.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/').get( requireAuth , checkOwnership(),  vehicleController.findAll).post(requireAuth,vehicleController.validateBody(),vehicleController.create)


router.route('/:vehicleId/unlink-driver').put(requireAuth,vehicleController.validateBody(true),vehicleController.unlinkDriver)


router.route('/:vehicleId/link-driver').put(requireAuth,vehicleController.validateBody(true),vehicleController.linkDriver)

router.route('/:vehicleId').get(requireAuth,vehicleController.findById).put(requireAuth,vehicleController.validateBody(true),vehicleController.update).delete(requireAuth,checkDeleteAuth(),vehicleController.delete)

export default router;