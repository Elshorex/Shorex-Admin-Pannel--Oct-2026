import express from 'express';
import {  requireAuth } from '../../services/passport.js';
import driverController from '../../controllers/driver.controller/driver.controller.js';
import userController from '../../controllers/user.controller/user.controller.js';
import { checkOwnership } from '../../helpers/CheckMethods.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";
const router = express.Router();

router.get('/', requireAuth,checkOwnership(),(req,res,next)=>{  req.query.type = 'DRIVER' ;next();}, userController.findAll);

router.route('/addUser').post(requireAuth, driverController.validateAddUserBody(), driverController.addUser);

router.get('/userInfo', requireAuth, driverController.userInformation)

router.put('/updateUser', requireAuth, driverController.validateAdminChangeUser(), driverController.adminUpdateUser);

router.delete('/:driverId', requireAuth,checkDeleteAuth(), driverController.deleteUserAccount)

router.put('/:driverId/assign-vehicle',  requireAuth, driverController.validateAssignVehicle(), driverController.assignVehicle);

router.put('/:driverId/unassign-vehicle', requireAuth, driverController.validateUnassignVehicle(),  driverController.unassignVehicle);


export default router;
