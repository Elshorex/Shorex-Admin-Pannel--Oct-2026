import express from 'express';
let router = express.Router();
import trademarkController from "../../controllers/trademark.controller/trademark.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";


router.route('/')
    .get(trademarkController.findAll)
    .post(requireAuth,
        trademarkController.validateBody(),trademarkController.create)


router.route('/:trademarkId')
    .get(requireAuth,trademarkController.findById)
    .put(
        requireAuth,
        
        trademarkController.validateBody(true),
        trademarkController.update
        )
    .delete(requireAuth,checkDeleteAuth(),trademarkController.delete)

export default router;