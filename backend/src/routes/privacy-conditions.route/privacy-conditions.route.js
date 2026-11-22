import express from 'express';

let router = express.Router();
import privacyController from "../../controllers/privacy-conditions.controller/privacy-conditions.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(privacyController.findAll)
    .post(requireAuth,privacyController.validateBody(),privacyController.create)


router.route('/:privacyId')
    .get(requireAuth,privacyController.findById)
    .put(requireAuth,privacyController.validateBody(true),privacyController.update)
    .delete(requireAuth,checkDeleteAuth(),privacyController.delete)

export default router;