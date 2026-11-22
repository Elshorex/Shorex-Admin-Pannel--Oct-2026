import express from 'express';
import advertismentController from '../../controllers/advertisments.controller/advertisments.controller.js';
import {requireAuth } from '../../services/passport.js';
import { multerSaveTo } from '../../services/multer-service.js';
import {parseObject} from '../../controllers/shared.controller/shared.controller.js';
const router = express.Router();

router.route('/republish')
    .post(requireAuth,advertismentController.validateRepublish(),advertismentController.republish)
    
router.route('/')
    .post(requireAuth,
        multerSaveTo('advertisment').array('images'),
        parseObject(['contactBy']),
        advertismentController.validateBody(),
        advertismentController.create)
    .get(advertismentController.find);

router.route('/deleteMutliple').delete(requireAuth,advertismentController.validateDeleteMulti(),advertismentController.deleteMuti)

router.route('/stop').put(requireAuth,advertismentController.validateStopAdvertisment(),advertismentController.stopAdvertisment)
router.route('/:AdvertismentsId/changeStatus').put(requireAuth,advertismentController.validateAdminChangeStatus(),advertismentController.changeStatus)
router.route('/:AdvertismentsId/increaseViews').put(advertismentController.updateNumberOfViews)

router.route('/:AdvertismentsId')
    .put(requireAuth,
        multerSaveTo('advertisment').array('images'),
        parseObject(['contactBy']),
        advertismentController.validateBody(true),
        advertismentController.update)
    .delete(requireAuth,advertismentController.delete)
    .get(advertismentController.findById)

    
export default router;