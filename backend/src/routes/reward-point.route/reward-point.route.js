import express from 'express';

let router = express.Router();
import rewardPointController from "../../controllers/reward-point.controller/reward-point.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/').get(rewardPointController.findAll).post(requireAuth,rewardPointController.validateBody(),rewardPointController.create)


router.route('/:pointId')
    .get(requireAuth,rewardPointController.findById)
    .put(requireAuth,rewardPointController.validateBody(true),rewardPointController.update)
    .delete(requireAuth,checkDeleteAuth(),rewardPointController.delete)

export default router;