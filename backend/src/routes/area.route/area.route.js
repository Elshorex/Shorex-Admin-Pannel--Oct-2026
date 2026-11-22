import express from 'express';

let router = express.Router();

import { requireAuth } from '../../services/passport.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js"; 
import areaController from '../../controllers/area.controller /area.controller.js';

// ✅ List + Create
router.route('/') .get(areaController.findAll).post(requireAuth, areaController.validateBody(), areaController.create);

// ✅ Single resource (get, update, delete)
router.route('/:areaId')
    .get(requireAuth, areaController.findById)
    .put(requireAuth, areaController.validateBody(true), areaController.update)
    .delete(requireAuth, checkDeleteAuth(), areaController.delete);

export default router;
