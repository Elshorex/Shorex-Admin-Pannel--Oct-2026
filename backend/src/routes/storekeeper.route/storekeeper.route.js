import express from 'express';

let router = express.Router();
import storeKeeperController from "../../controllers/store-keeper.controller/store-keeper.controller.js";
import userController from '../../controllers/user.controller/user.controller.js';
import {requireAuth} from '../../services/passport.js';
import { checkOwnership } from "../../helpers/CheckMethods.js";


router.get('/', requireAuth,(req,res,next)=>{  req.query.type = 'STORE_KEEPER' ;next();}, checkOwnership(),userController.findAll);



router.route('/:storeKeeperId')
    .get(requireAuth,storeKeeperController.userInformation)
    .put(requireAuth,storeKeeperController.validateChangeUser(),storeKeeperController.updateUser)

export default router;