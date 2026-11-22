import express from 'express';
const router = express.Router();
import promocodeController from '../../controllers/promocode.controller/promocode.controller.js';
import { requireAuth } from '../../services/passport.js';

router.route('/')
      .post(requireAuth, promocodeController.validateBody(),promocodeController.create)
      .get(promocodeController.findAll)

router.post('/confirmPromoCode',requireAuth,promocodeController.validateConfirm(),promocodeController.confirmCode)
router.route('/deleteMutliple').delete(requireAuth,promocodeController.validateDeleteMulti(),promocodeController.deleteMuti)

router.route('/:id')
      .get(promocodeController.findById)
      .delete(requireAuth, promocodeController.delete)
      .put(promocodeController.validateUpdateBody(),promocodeController.update)


export default router;