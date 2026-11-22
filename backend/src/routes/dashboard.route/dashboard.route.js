import express from 'express';
import dashboardController from '../../controllers/dashboard.controller/dashboard.controller.js';
import {requireAuth} from '../../services/passport.js';

const router = express.Router();


router.route('/count').get(requireAuth,dashboardController.count);

router.route('/claim-reward-graph').get(requireAuth,dashboardController.claimRewardGraph);
router.route('/request-status-graph').get(requireAuth,dashboardController.requestStatusGraph);
router.route('/customer-graph').get(requireAuth,dashboardController.customerGraph);
router.route('/provider-requests-graph').get(requireAuth,dashboardController.providerRequestsGraph);


export default router;
