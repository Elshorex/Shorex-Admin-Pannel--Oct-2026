import express from 'express';
const router = express.Router();
import warehouseController from "../../controllers/warehouse.controller/warehouse.controller.js";
import storeKeeperController from "../../controllers/store-keeper.controller/store-keeper.controller.js";
import { requireAuth } from '../../services/passport.js';
import { checkOwnership } from "../../helpers/CheckMethods.js";
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";


router.route('/new').post(requireAuth, storeKeeperController.validateStoreKeeperData(), warehouseController.validateBody(), warehouseController.create)
router.route('/exist').post(requireAuth, warehouseController.validateStoreKeeper(), warehouseController.validateBody(), warehouseController.create)
router.route('/').get( requireAuth, checkOwnership(),    warehouseController.findAll)

router.route('/warehouse-stock/:warehouseId').get(requireAuth, warehouseController.getWarehouseStock)

router.route('/:warehouseId')
.get(requireAuth, warehouseController.findById)
.put(requireAuth,storeKeeperController.validateChangeUser(),warehouseController.validateBody(true),warehouseController.update)
.delete(requireAuth,checkDeleteAuth(), warehouseController.delete)


////////////////////////////  store keeper ////////////////////
router.route('/:warehouseId/store-keeper').delete(requireAuth,checkDeleteAuth(), warehouseController.removeStoreKeeper)

router.route('/:warehouseId/store-keeper/new').post(requireAuth,storeKeeperController.validateStoreKeeperData(),warehouseController.changeStoreKeeper)

router.route('/:warehouseId/store-keeper/exist').post(requireAuth,warehouseController.validateStoreKeeper(),warehouseController.changeStoreKeeper )


export default router;