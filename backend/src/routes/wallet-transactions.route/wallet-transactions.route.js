import express from 'express';
const router = express.Router();
import walletTransactionController from "../../controllers/wallet-transactions.controller/wallet-transactions.controller.js";
import {requireAuth} from '../../services/passport.js';


router.route('/').get(requireAuth,walletTransactionController.findAll)

router.route('/:walletTransactionId').get(requireAuth,walletTransactionController.findById).delete(requireAuth,walletTransactionController.delete)

export default router;