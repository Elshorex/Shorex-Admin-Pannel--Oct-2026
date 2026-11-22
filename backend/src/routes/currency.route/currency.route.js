import express from 'express';

let router = express.Router();
import currencyController from "../../controllers/currency.controller/currency.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(currencyController.findAll)
    .post(requireAuth,currencyController.validateBody(),currencyController.create)


router.route('/:currencyId')
    .get(requireAuth,currencyController.findById)
    .put(requireAuth,currencyController.validateBody(true),currencyController.update)
    .delete(requireAuth,checkDeleteAuth(),currencyController.delete)

export default router;