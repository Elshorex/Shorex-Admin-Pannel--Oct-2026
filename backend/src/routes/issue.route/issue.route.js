import express from 'express';

let router = express.Router();
import issueController from "../../controllers/issue.controller/issue.controller.js";
import { requireAuth } from '../../services/passport.js';

router.route('/')
    .get(requireAuth, issueController.findAll)
    .post(requireAuth,issueController.validateBody(), issueController.create)


router.route('/:issueId')
    .get(issueController.findById)
    .put(requireAuth,issueController.validateBody(true),issueController.update)
    .delete(requireAuth, issueController.delete)

export default router;