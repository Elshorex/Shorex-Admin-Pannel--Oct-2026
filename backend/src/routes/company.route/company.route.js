import express from 'express';
import CompanyController from '../../controllers/company.controller/company.controller.js';
import { requireAuth } from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";
const router = express.Router();

     
router.route('/')
    .post(
        CompanyController.validateBody(),
        CompanyController.create
    )
    .get(CompanyController.findById)
    .put(
        CompanyController.validateBody(),
        CompanyController.update
    )
    .delete(requireAuth,checkDeleteAuth(),CompanyController.delete);
    
export default router;
