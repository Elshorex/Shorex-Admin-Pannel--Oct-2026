import express from 'express';
import { requireAuth } from '../../services/passport.js';
import { multerSaveTo } from '../../services/multer-service.js';
import userController from '../../controllers/user.controller/user.controller.js';
import { checkDeleteAuth } from "../../helpers/CheckMethods.js";

const uploadedFiles = [
    { name: "image", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
]
const router = express.Router();


router.route('/deleteMutliple').delete(requireAuth,checkDeleteAuth(), userController.validateDeleteMulti(), userController.deleteMuti)

router.route('/user/openActiveChatHead').put(requireAuth, userController.validateOpenActiveChatHead(), userController.openActiveChatHead)
router.route('/user/closeActiveChatHead').put(requireAuth, userController.closeActiveChatHead)

router.post('/request-account-deletion', userController.validateRequestAccountDeletion(), userController.requestAccountDeletion);

router.route('/signup').post(multerSaveTo('users').single('image'), userController.validateUserCreateBody(), userController.userSignUp);

router.route('/socialMedia').post(userController.validateSocialMediaLogin(), userController.socialMedialLogin);

router.route('/deleteAccount').delete(requireAuth,checkDeleteAuth(), userController.validateDeleteUserAccount(), userController.deleteUserAccount);

router.post('/signin', userController.validateUserSignin(), userController.signIn);

router.get('/allUsers', requireAuth, userController.findAll);

router.get('/userInfo',requireAuth, userController.userInformation)
// router.get('/userInfo', userController.userInformation)

router.route('/addToken').post(requireAuth, userController.validateAddToken(), userController.addToken);

router.route('/logout').post(requireAuth, userController.validateLogout(), userController.logout);


router.post('/checkExistPhone', userController.validateCheckPhone(), userController.checkExistPhone);
router.post('/checkExistEmail', userController.validateCheckEmail(), userController.checkExistEmail);


router.put('/user/updateInfo',
    requireAuth,
    multerSaveTo('users').fields(uploadedFiles),
    userController.validateUserUpdate(true),
    userController.updateInfo);

router.put('/user/changePassword', requireAuth, userController.validateUpdatedPassword(), userController.updatePasswordFromProfile);

router.post('/reset-password', userController.validateResetPassword() , userController.resetPassword);

// forgetpassword by mail   
// Right now ONLY FOR ADMIN/PROVIDER
// router.post('/forgetPassword', userController.validateForgetPassword(), userController.forgetPasswordNodeMailer);
router.post('/forgetPassword', userController.validateForgetPassword(), userController.forgetPasswordTwilioEmail);
router.put('/confirmationCode', userController.validateConfirmCode(), userController.verifyForgetPasswordCode);
router.put('/confirmationchange', userController.validateResetPassword(), userController.updatePassword);

// forgetpassword by phone number  
router.post('/phoneForgetPassword', userController.validateForgetPasswordByPhone(), userController.forgetPasswordByPhone);
router.put('/phoneConfirmationCode', userController.validateVerifyForgetPasswordByPhone(), userController.verifyForgetPasswordByPhone);
router.put('/phonePasswordChange', userController.validateUpdatePasswordByPhone(), userController.updatePasswordByPhone);

router.route('/account').delete(requireAuth,checkDeleteAuth(), userController.deleteAccount);

router.route('/user/delete-account').delete(requireAuth, userController.deleteAccountForCustomer);

router.post('/uploadImage', multerSaveTo('users').single('image'), userController.uploadImage)


// confirm  phone 
router.post('/verifyPhone', userController.validateCheckPhoneVerified(), userController.checkPhoneVerified);
router.post('/verifyPhoneFromProfile',
    requireAuth,
    userController.validateCheckPhoneVerified(),
    userController.checkPhoneVerified);
router.put('/confirmPhoneCode', userController.validatePhoneVerifiedCode(), userController.verifyPhoneVerifiedCode);


export default router;
