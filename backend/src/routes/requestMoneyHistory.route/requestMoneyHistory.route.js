import express from 'express';

let router = express.Router();
import requestMoneyHistoryController from "../../controllers/requestMoneyHistory.controller/requestMoneyHistory.controller.js";
import {requireAuth} from '../../services/passport.js';

router.route('/').get(requestMoneyHistoryController.findAll).post(requireAuth,requestMoneyHistoryController.validateBody(),requestMoneyHistoryController.create)

router.route('/:requestMoneyId/payed').post(requireAuth,requestMoneyHistoryController.payedOrders)

router.route('/:requestMoneyId').get(requireAuth,requestMoneyHistoryController.findById).delete(requireAuth,requestMoneyHistoryController.delete)

export default router;