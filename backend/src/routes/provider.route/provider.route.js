import express from 'express';
import {  requireAuth } from '../../services/passport.js';
import providerController from '../../controllers/provider.controller/provider.controller.js';
import userController from '../../controllers/user.controller/user.controller.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

const router = express.Router();

router.get('/', requireAuth,(req,res,next)=>{  req.query.type = 'PROVIDER' ;next();}, userController.findAll);

router.route('/addUser').post(requireAuth, providerController.validateAddUserBody(), providerController.addUser);

router.get('/userInfo', requireAuth, providerController.userInformation)

router.put('/updateUser',requireAuth,providerController.validateAdminChangeUser(),providerController.adminUpdateUser);



export default router;
