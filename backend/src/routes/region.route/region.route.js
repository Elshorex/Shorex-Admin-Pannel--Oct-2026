import express from 'express';

let router = express.Router();
import regionController from "../../controllers/region.controller/region.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(regionController.findAll) 
    .post(requireAuth,regionController.validateBody(),regionController.create)


router.route('/:regionId')
    .get(requireAuth,regionController.findById)
    .put(requireAuth,regionController.validateBody(true),regionController.update)
    .delete(requireAuth,checkDeleteAuth(),regionController.delete)

export default router;