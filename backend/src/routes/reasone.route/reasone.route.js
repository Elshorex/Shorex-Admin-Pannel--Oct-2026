import express from 'express';
import reasoneController from '../../controllers/reasone.controller/reasone.controller.js';
import { requireAuth } from '../../services/passport.js';
const router = express.Router();

router.route('/')
    .post(requireAuth,
        reasoneController.validateBody(),
        reasoneController.create
    )
    .get(reasoneController.findAll);


router.route('/dislike/:reasoneId').post(reasoneController.disLikeReasone)
router.route('/like/:reasoneId').post(reasoneController.likeReasone)

router.route('/:reasoneId')
    .put(requireAuth, 
        reasoneController.validateBody(true), reasoneController.update)
    .delete(requireAuth, reasoneController.delete)
    .get(reasoneController.findById)


export default router;