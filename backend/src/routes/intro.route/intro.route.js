var express = require('express');
var router = express.Router();
import introController from "../../controllers/intro.controller/intro.controller.js";
import {requireAuth} from '../../services/passport.js';

import { multerSaveTo } from '../../services/multer-service.js';
import { parseObject } from '../../controllers/shared.controller/shared.controller.js'

let parseArray = ['title','text'];

const uploadedFiles =[
    {name:"image",maxCount:1},
    {name:"imageContent",maxCount:1},
    {name:"videoContent",maxCount:1}
]


router.route('/')
    .get(introController.findAll)
    .post(requireAuth, multerSaveTo('intro').fields(uploadedFiles),parseObject(parseArray),introController.validateBody(),introController.create)


router.route('/:introId')
    .get(/*requireAuth,*/introController.findById)
    .put(requireAuth, multerSaveTo('intro').fields(uploadedFiles),parseObject(parseArray),introController.validateBody(true),introController.update)
    .delete(requireAuth,introController.delete)

export default router;