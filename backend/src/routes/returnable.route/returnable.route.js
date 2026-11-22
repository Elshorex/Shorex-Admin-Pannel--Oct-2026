import express from 'express';

let router = express.Router();

import { requireAuth } from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js"; 
import returnableController from '../../controllers/returnable.controller/returnable.controller.js';

// ✅ List all returnables + Create new
router.route('/')
    .get(requireAuth, returnableController.findAll)
    .post(requireAuth, returnableController.validateBody(), returnableController.create);

// ✅ Single returnable (Get, Update, Delete)
router.route('/:returnableId')
    .get(requireAuth, returnableController.findById)
    .put(requireAuth, returnableController.validateBody(true), returnableController.update)
    .delete(requireAuth, checkDeleteAuth(), returnableController.delete);

// ✅ Change status (e.g., Delivered → Received → Returned)
router.route('/:returnableId/status')
    .patch(requireAuth, returnableController.changeStatus);

export default router;
