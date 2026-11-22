import express from 'express';

let router = express.Router();
import assignRuleController from "../../controllers/assignRule.controller/assignRule.controller.js";
import {requireAuth} from '../../services/passport.js';

router.route('/')
    .get(requireAuth,assignRuleController.findAll)
    .post(requireAuth,assignRuleController.validateBody(),assignRuleController.create)


router.route('/:assignRuleId')
    .get(requireAuth,assignRuleController.findById)
    .put(requireAuth,assignRuleController.validateBody(true),assignRuleController.update)
    .delete(requireAuth,assignRuleController.delete)

export default router;