import express from 'express';

let router = express.Router();
import countryController from "../../controllers/recycle.controller/recycle.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(countryController.findAll)
    .post(requireAuth,
        
        countryController.validateBody(),countryController.create)


router.route('/:recycleId')
    .get(requireAuth,countryController.findById)
    .put(
        requireAuth,
        
        countryController.validateBody(true),
        countryController.update
        )
    .delete(requireAuth,checkDeleteAuth(),countryController.delete)

export default router;