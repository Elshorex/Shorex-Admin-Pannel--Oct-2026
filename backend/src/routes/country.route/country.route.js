import express from 'express';
const router = express.Router();
import countryController from "../../controllers/country.controller/country.controller.js";
import {requireAuth} from '../../services/passport.js';
import { multerSaveTo } from '../../services/multer-service.js';
import { parseObject } from "../../controllers/shared.controller/shared.controller.js";
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

let parseArray = ['name'];

// router.route('/')
//     .get(countryController.findAll)
//     .post(requireAuth,
//         // multerSaveTo('country').single('image'),
//         // parseObject(parseArray),
//         countryController.validateBody(),countryController.create)
router.route('/')
    .get(countryController.findAll)
    .post(countryController.validateBody(),countryController.create)

router.route('/:countryId')
    .get(requireAuth,countryController.findById)
    .put(
        requireAuth,
        // multerSaveTo('country').single('image'),
        // parseObject(parseArray),
        countryController.validateBody(true),
        countryController.update
        )
    .delete(requireAuth,checkDeleteAuth(),countryController.delete)

export default router;