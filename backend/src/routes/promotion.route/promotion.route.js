import express from 'express';

let router = express.Router();
import promotionController from "../../controllers/promotion.controller/promotion.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(promotionController.findAll)
    .post(requireAuth,promotionController.validateBody(),promotionController.create)


router.route('/:promotionId')
    .get(requireAuth,promotionController.findById)
    .put(requireAuth,promotionController.validateBody(true),promotionController.update)
    .delete(requireAuth,checkDeleteAuth(),promotionController.delete)

export default router;