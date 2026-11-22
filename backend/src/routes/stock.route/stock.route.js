import express from 'express';

let router = express.Router();
import stockController from "../../controllers/stock.controller/stock.controller.js";
import { checkOwnership } from "../../helpers/CheckMethods.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/').get(requireAuth,checkOwnership(), stockController.findAll)


router.route('/:productId/warehouse/:warehouseId').delete(requireAuth,checkDeleteAuth(),stockController.clearStock)
    




export default router;