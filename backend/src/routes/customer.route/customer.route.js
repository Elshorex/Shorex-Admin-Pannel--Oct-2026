import express from 'express';
import {  requireAuth } from '../../services/passport.js';
import customerController from '../../controllers/customer.controller/customer.controller.js';
import userController from '../../controllers/user.controller/user.controller.js';
import { checkOwnership } from '../../helpers/CheckMethods.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";
const router = express.Router();

router.get('/', requireAuth,checkOwnership(),(req,res,next)=>{  req.query.type = 'CLIENT' ;next();}, userController.findAll);

router.route('/addUser')
    .post(requireAuth, customerController.validateAddUserBody(), customerController.addUser);

router.get('/userInfo', requireAuth, customerController.userInformation)

router.put('/updateUser',
    requireAuth,
    customerController.validateAdminChangeUser(),
    customerController.adminUpdateUser);


router.delete('/:customerId', requireAuth,checkDeleteAuth(), customerController.deleteUserAccount)



export default router;
