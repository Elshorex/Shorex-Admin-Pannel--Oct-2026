import express from 'express';

let router = express.Router();
import sliderController from "../../controllers/slider.controller/slider.controller.js";
import {requireAuth} from '../../services/passport.js';
import {multerSaveTo} from '../../services/multer-service.js';
import {parseObject} from '../../controllers/shared.controller/shared.controller.js'

router.route('/')
    .get(sliderController.findAll)
    .post(requireAuth,
        multerSaveTo('sliders').single('image'),
        parseObject(['title']),
        sliderController.validateBody(),sliderController.create)


router.route('/:id')
    .get(sliderController.findById)
    .put(requireAuth,
        multerSaveTo('sliders').single('image'),
        parseObject(['title']),
        sliderController.validateBody(true),
        sliderController.update)

    .delete(requireAuth,sliderController.delete)

export default router;