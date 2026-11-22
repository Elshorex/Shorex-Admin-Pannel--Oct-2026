import express from 'express';

let router = express.Router();
import branchProductController from "../../controllers/branch-product.controller/branch-product.controller.js";
import { requireAuth } from '../../services/passport.js';
import { multerSaveTo } from '../../services/multer-service.js';
import { parseObject } from '../../controllers/shared.controller/shared.controller.js';

router.route('/')
    .get(branchProductController.findAll)
    .post(requireAuth,
        multerSaveTo('branchProduct').single('icon'),
        parseObject(['name']),
        branchProductController.validateBody(), 
        branchProductController.create
    )

router.route('/check').post(requireAuth,branchProductController.validateBody(),branchProductController.checkProductsBranch)
router.route('/deleteMutliple').delete(requireAuth,branchProductController.validateDeleteMulti(),branchProductController.deleteMuti)

router.route('/:branchProductId')
    .get(branchProductController.findById)
    // .put(requireAuth,
    //     multerSaveTo('branchProduct').single('icon'),
    //     parseObject(['name']),
    //     branchProductController.validateBody(true),
    //     branchProductController.update
    // )
    .delete(requireAuth, branchProductController.delete)

export default router;