import express from 'express';

let router = express.Router();
import ruleController from "../../controllers/rule.controller/rule.controller.js";
import {requireAuth} from '../../services/passport.js';

router.route('/')
    .get(requireAuth,ruleController.findAll)
    .post(requireAuth,ruleController.validate(),ruleController.create)


router.route('/:ruleId')
    .get(requireAuth,ruleController.findById)
    .put(requireAuth,ruleController.validate(true),ruleController.update)
    .delete(requireAuth,ruleController.delete)

export default router;