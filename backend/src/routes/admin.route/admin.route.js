import express from 'express';
import { requireSignIn, requireAuth } from '../../services/passport.js';
import { multerSaveTo } from '../../services/multer-service.js';
import adminController from '../../controllers/admin.controller/admin.controller.js';
import { parseObject } from '../../controllers/shared.controller/shared.controller.js';

const parseArray = [  'location']

const router = express.Router();

 
router.post('/reset-wallet',requireAuth, adminController.validateResetWallet(), adminController.resetWallet);
router.post('/user-wallet',requireAuth, adminController.validateAddWallet(), adminController.addWallet);
router.post('/user-points',requireAuth, adminController.validateAddPoints(), adminController.addPoints);

router.route('/signup').post(multerSaveTo('users').single('image'), adminController.validateAdminSignUp(), adminController.signUp);

router.post('/signin', adminController.validateAdminSignin(), adminController.adminSignIn);

router.put('/updateProfile',
    requireAuth,
    multerSaveTo('users').single('image'),
    adminController.validateAdminSignUp(true),
    adminController.updateProfile);

router.route('/addUser')
    .post(multerSaveTo('users').single('image'),
        requireAuth, adminController.validateAddUserBody(), adminController.addUser);

router.get('/userInfo', requireAuth, adminController.userInformation)

router.put('/activate', requireAuth, adminController.validateAdminActivateUser(), adminController.adminActivateUser);
router.route('/account').delete(requireAuth, adminController.validateDeleteUserAccount(), adminController.deleteUserAccount);

router.put('/updateUser',
    requireAuth,
    multerSaveTo('users').single('image'),
    parseObject(parseArray),
    adminController.validateAdminChangeUser(),
    adminController.adminUpdateUser);

router.route('/deleteFromArchive').delete(requireAuth, adminController.validateDeleteFromArchive(), adminController.deleteFromArchive);

router.post('/uploadImage', requireAuth, multerSaveTo('admins').single('image'), adminController.uploadImage)


export default router;
