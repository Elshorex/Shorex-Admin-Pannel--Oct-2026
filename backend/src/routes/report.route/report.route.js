import express from 'express';
import reportController from '../../controllers/reports.controller/reports.controller.js';
import {requireAuth} from '../../services/passport.js';

const router = express.Router();


router.route('/users').get(requireAuth,reportController.usersReport);
router.route('/category').get(requireAuth,reportController.categoryReport);
router.route('/complain').get(requireAuth,reportController.complainReport);
router.route('/most-complain').get(requireAuth,reportController.mostUsedComplainReason);
router.route('/driver').get(requireAuth,reportController.driverReport);

export default router;
