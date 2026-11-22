import express from 'express';

let router = express.Router();
import contactsController from "../../controllers/contact-us.controller/contact-us.controller.js";
import {requireAuth} from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

// router.route('/')
//     .get(contactsController.findAll)
//     .post(requireAuth,contactsController.validateBody(),contactsController.create)


// router.route('/:contactusId')
//     .get(requireAuth,contactsController.findById)
//     .put(requireAuth,contactsController.validateBody(true),contactsController.update)
//     .delete(requireAuth,checkDeleteAuth(),contactsController.delete)


router.route('/')
    .get(contactsController.findAll)
    .post(contactsController.validateBody(),contactsController.create)


router.route('/:contactusId')
    .get(contactsController.findById)
    .put(requireAuth,contactsController.validateBody(true),contactsController.update)
    .delete(requireAuth,checkDeleteAuth(),contactsController.delete)

export default router;