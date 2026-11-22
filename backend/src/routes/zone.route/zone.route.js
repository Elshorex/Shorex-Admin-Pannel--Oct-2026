import express from 'express';
const router = express.Router();
import zoneController from "../../controllers/zone.controller/zone.controller.js";
import {requireAuth} from '../../services/passport.js';

router.route('/check-in-zone').get(zoneController.checkLatLongZone)
router.route('/')
    .get(zoneController.findAll)
    .post(requireAuth,
        zoneController.validateBody(),
        zoneController.create)


router.route('/:zoneId')
    .get(zoneController.findById)
    .put(requireAuth,
        zoneController.validateBody(true),
        zoneController.update)
    .delete(requireAuth,zoneController.delete)

export default router;