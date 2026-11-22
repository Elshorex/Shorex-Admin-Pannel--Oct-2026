import express from 'express';

let router = express.Router();
import holidayController from "../../controllers/holidays.controller/holidays.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(holidayController.findAll)
    .post(requireAuth,holidayController.validateBody(),holidayController.create)


router.route('/:holidayId')
    .get(requireAuth,holidayController.findById)
    .put(requireAuth,holidayController.validateBody(true),holidayController.update)
    .delete(requireAuth,checkDeleteAuth(),holidayController.delete)

export default router;