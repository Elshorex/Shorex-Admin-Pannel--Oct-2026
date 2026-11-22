import express from 'express';

let router = express.Router();
import statusController from "../../controllers/status.controller/status.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(statusController.findAll)
    .post(requireAuth,statusController.validateBody(),statusController.create)


router.route('/:statusId')
    .get(requireAuth,statusController.findById)
    .put(requireAuth,statusController.validateBody(true),statusController.update)
    .delete(requireAuth,checkDeleteAuth(),statusController.delete)

export default router;