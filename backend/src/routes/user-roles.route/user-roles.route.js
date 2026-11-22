import express from 'express';
let router = express.Router();
import userRoleController from "../../controllers/user-roles.controller/user-roles.controller.js";
import { requireAuth } from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

router.route('/')
    .get(userRoleController.findAll)
    .post(requireAuth,
        
        userRoleController.validateBody(), userRoleController.create)

router.route('/deleteMutliple').delete(requireAuth,checkDeleteAuth(),
    userRoleController.validateDeleteMulti(),
    userRoleController.deleteMuti
    )

router.route('/:userRoleId')
    .get(userRoleController.findById)
    .put(requireAuth,
        
        userRoleController.validateBody(true),
        userRoleController.update)
    .delete(requireAuth,checkDeleteAuth(), userRoleController.delete)

export default router;