import express from 'express';
const router = express.Router();
import vehicleHistoryController from "../../controllers/vehicle-history.controller/vehicle-history.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(vehicleHistoryController.findAll)


router.route('/:historyId')
    .get(requireAuth,vehicleHistoryController.findById)
    .delete(requireAuth,checkDeleteAuth(),vehicleHistoryController.delete)

export default router;