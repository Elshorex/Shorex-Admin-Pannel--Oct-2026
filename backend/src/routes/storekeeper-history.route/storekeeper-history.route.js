import express from 'express';

let router = express.Router();
import storeKeeperHistoryController from "../../controllers/storekeeper-history.controller/storekeeper-history.controller.js";
import { checkOwnership } from "../../helpers/CheckMethods.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/').get( requireAuth,checkOwnership(), storeKeeperHistoryController.findAll)
router.route('/:storeKeeperId').get(requireAuth,storeKeeperHistoryController.findById).delete(requireAuth,checkDeleteAuth(),storeKeeperHistoryController.delete)

export default router;