import express from 'express';

let router = express.Router();
import charityController from "../../controllers/charity.controller/charity.controller.js";
import { requireAuth } from '../../services/passport.js';
import { multerSaveTo } from '../../services/multer-service.js';
import { parseObject } from '../../controllers/shared.controller/shared.controller.js';

router.route('/')
    .get(charityController.findAll)
    .post(requireAuth,
        multerSaveTo('charity').single('icon'),
        parseObject(['name']),
        charityController.validateBody(), charityController.create)

router.route('/deleteMutliple').delete(requireAuth,charityController.validateDeleteMulti(),charityController.deleteMuti)

router.route('/:charityId')
    .get(charityController.findById)
    .put(requireAuth,
        multerSaveTo('charity').single('icon'),
        parseObject(['name']),
        charityController.validateBody(true),
        charityController.update)
    .delete(requireAuth, charityController.delete)

export default router;