import express from 'express';

let router = express.Router();
import cityController from "../../controllers/city.controller/city.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(cityController.findAll)
    .post(requireAuth,cityController.validateBody(),cityController.create)


router.route('/:cityId')
    .get(requireAuth,cityController.findById)
    .put(requireAuth,cityController.validateBody(true),cityController.update)
    .delete(requireAuth,checkDeleteAuth(),cityController.delete)

export default router;