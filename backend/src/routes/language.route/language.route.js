import express from 'express';

let router = express.Router();
import languageController from "../../controllers/language.controller/language.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(languageController.findAll)
    .post(requireAuth,languageController.validateBody(),languageController.create)


router.route('/:languageId')
    .get(requireAuth,languageController.findById)
    .put(requireAuth,languageController.validateBody(true),languageController.update)
    .delete(requireAuth,checkDeleteAuth(),languageController.delete)

export default router;