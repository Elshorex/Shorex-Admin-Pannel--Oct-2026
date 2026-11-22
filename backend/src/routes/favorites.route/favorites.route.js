import express from 'express';

let router = express.Router();
import favoritesController from "../../controllers/favorites.controller/favorites.controller.js";
import {requireAuth} from '../../services/passport.js';

router.route('/trader').post(requireAuth,favoritesController.validateTrader(),favoritesController.create)
router.route('/product').post(requireAuth,favoritesController.validateBody(),favoritesController.create)
router.route('/client').get(requireAuth,favoritesController.findAllForClient)

router.route('/')
    .get(favoritesController.findAll)
    .delete(requireAuth,favoritesController.delete)

router.route('/:favoriteId')
    .get(requireAuth,favoritesController.findById)
    .put(requireAuth,favoritesController.validateBody(true),favoritesController.update)
    

export default router;