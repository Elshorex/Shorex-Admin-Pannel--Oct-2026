import bcrypt from 'bcryptjs';
import { body } from "express-validator";
import { checkValidations, handleImg } from '../shared.controller/shared.controller.js';
import { generateToken } from '../../utils/token.js';
import User from '../../models/user.model/user.model.js';
import UserRole from '../../models/user-roles.model/user-roles.model.js';
import { checkExistThenGet, checkExist } from '../../helpers/CheckMethods.js';
import ApiError from '../../helpers/ApiError.js';
import i18n from 'i18n'
import socketEvents from '../../socketEvents.js';
import ConfirmationCode from '../../models/confirmationsCodes.model/confirmationscodes.model.js'
import notificationController from '../notif.controller/notif.controller.js';
import config from '../../config.js'
import dotObject from 'dot-object';
import userController from '../user.controller/user.controller.js';
import pointsController from "../wallet-transactions.controller/wallet-transactions.controller.js";
import Status from "../../models/status.model/status.model.js";
import Country from "../../models/country.model/country.model.js";

let populateQuery = [
    { path: 'status', model: 'status' },
    // { path: 'rules', model: 'assignRule' },
    { path: 'country', model: 'country' },
    { path: 'role', model: 'userRole' }
    // { path: 'category', model: 'category' },
    // { path: 'subCategory', model: 'category' },
    // { path: 'city', model: 'city', populate: [{ path: 'country', model: 'country' }] },
];

let count = async (type) => {
    try {
        let count = await User.count({ deleted: false, status: 'WAITING', type: type });
        if (type == 'DRIVER') {
            adminNSP.emit(socketEvents.WaitingDriverCount, { count: count });

        } else {
            adminNSP.emit(socketEvents.WaitingInstitutionCount, { count: count });
        }
    } catch (error) {
        throw error;
    }
}
export default {


    validateAdminSignUp(isUpdate = false) {
        let validations;
        if (!isUpdate) { 
            validations = [
                body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('statusRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Status, { deleted: false });
                        return true;
                    }),
                body('role').optional().not().isEmpty().withMessage(() => { return i18n.__('roleRequired') })
                .custom(async (value, { req }) => {
                    req.role = await checkExistThenGet(value, UserRole, { deleted: false });
                    return true;
                }),
                body('name').not().isEmpty().withMessage(() => { return i18n.__('nameRequired') }),
                body('email').trim().not().isEmpty().withMessage(() => { return i18n.__('emailRequired') })
                    .isEmail().withMessage(() => { return i18n.__('EmailNotValid') })
                    .custom(async (value, { req }) => {
                        value = (value.trim()).toLowerCase();
                        let userQuery = { email: value, deleted: false };
                        if (await User.findOne(userQuery))
                            throw new Error(i18n.__('emailDuplicated'));
                        else
                            return true;
                    }),
                body('password').not().isEmpty().withMessage(() => { return i18n.__('passwordRequired') }),
                // body('type').not().isEmpty().withMessage(() => { return i18n.__('typeIsRequired') })
                //     .isIn(['ADMIN', 'SUB_ADMIN']).withMessage(() => { return i18n.__('userTypeWrong') }),
                body('country').optional().not().isEmpty().withMessage(() => { return i18n.__('countryRequired') })
                    .custom(async (value, { req }) => {
                        await checkExist(value, Country, { deleted: false });
                        return true;
                    }),
                body('phone').not().isEmpty().withMessage(() => { return i18n.__('PhoneIsRequired') })
                    .custom(async (value, { req }) => {
                        value = (value.trim()).toLowerCase();
                        let userQuery = { phone: value, deleted: false };
                        if (await User.findOne(userQuery))
                            throw new Error(i18n.__('phoneIsDuplicated'));
                        else
                            return true;
                    }),
                body('language').optional().not().isEmpty().withMessage(() => { return i18n.__('languageRequired') }),
                body('countryCode').not().isEmpty().withMessage(() => { return i18n.__('countryCodeRequired') }),
                body('countryKey').not().isEmpty().withMessage(() => { return i18n.__('countryKeyRequired') })
            ];
        } else {
            validations = [
                body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('statusRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Status, { deleted: false });
                        return true;
                    }),
                body('role').optional().not().isEmpty().withMessage(() => { return i18n.__('roleRequired') })
                .custom(async (value, { req }) => {
                    req.role = await checkExistThenGet(value, UserRole, { deleted: false });
                    return true;
                }),
                body('name').optional().not().isEmpty().withMessage(() => { return i18n.__('nameRequired') }),
                body('email').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('emailRequired') })
                    .isEmail().withMessage(() => { return i18n.__('EmailNotValid') })
                    .custom(async (value, { req }) => {
                        value = (value.trim()).toLowerCase();
                        let userQuery = { email: value, deleted: false, _id: { $ne: req.user._id } };
                        if (await User.findOne(userQuery))
                            throw new Error(i18n.__('emailDuplicated'));
                        else
                            return true;
                    }),
                body('password').optional().not().isEmpty().withMessage(() => { return i18n.__('passwordRequired') }),
                body('country').optional().not().isEmpty().withMessage(() => { return i18n.__('countryRequired') })
                    .custom(async (value, { req }) => {
                        await checkExist(value, User, { deleted: false });
                        return true;
                    }),
                body('phone').optional().not().isEmpty().withMessage(() => { return i18n.__('PhoneIsRequired') })
                    .custom(async (value, { req }) => {
                        value = (value.trim()).toLowerCase();
                        let userQuery = { phone: value, deleted: false, _id: { $ne: req.user._id } };

                        if (await User.findOne(userQuery))
                            throw new Error(i18n.__('phoneIsDuplicated'));
                        else
                            return true;
                    }),
                body('language').optional().not().isEmpty().withMessage(() => { return i18n.__('languageRequired') }),
                body('newPassword').optional().not().isEmpty().withMessage(() => { return i18n.__('newPasswordRequired') }),
                body('currentPassword').optional().not().isEmpty().withMessage(() => { return i18n.__('CurrentPasswordRequired') }),
                body('countryCode').optional().not().isEmpty().withMessage(() => { return i18n.__('countryCodeRequired') }),
                body('countryKey').optional().not().isEmpty().withMessage(() => { return i18n.__('countryKeyRequired') })
            ];
        }
        return validations;
    },

    async signUp(req, res, next) {
        try {
            console.log(req.body,'admin body');
            const validatedBody = checkValidations(req);
            validatedBody.type = req.role ?  req.role.type : 'ADMIN';
            validatedBody.email = (validatedBody.email.trim()).toLowerCase();
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'image', isUpdate: false });
                validatedBody.image = image;
            }
            let createdUser = await User.create(validatedBody);
            res.status(200).send({ user: createdUser, token: generateToken(createdUser.id) })
        } catch (err) {
            next(err);
        }
    },

    async updateProfile(req, res, next) {
        try {
            let user = req.user;
            const validatedBody = checkValidations(req);
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'image', isUpdate: false });
                validatedBody.image = image;
            }
            if (validatedBody.password) {
                const salt = bcrypt.genSaltSync();
                validatedBody.password = await bcrypt.hash(validatedBody.password, salt);
            }
            if (validatedBody.newPassword) {

                if (validatedBody.currentPassword) {
                    if (bcrypt.compareSync(validatedBody.currentPassword, user.password)) {
                        const salt = bcrypt.genSaltSync();
                        let hash = await bcrypt.hash(validatedBody.newPassword, salt);
                        validatedBody.password = hash;
                        delete validatedBody.newPassword;
                        delete validatedBody.currentPassword;
                        user = await User.findOneAndUpdate({ deleted: false, _id: user.id }, validatedBody, { new: true })
                        user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());
                        res.status(200).send(user);
                    } else {
                        return next(new ApiError(403, i18n.__('currentPasswordInvalid')))
                    }
                } else {
                    return res.status(400).send({
                        error: [{
                            location: 'body',
                            param: 'currentPassword', msg: i18n.__('CurrentPasswordRequired')
                        }]
                    });
                }
            } else {
                user = await User.findOneAndUpdate({ deleted: false, _id: user.id }, validatedBody, { new: true })
                res.status(200).send(user);
            }
        } catch (err) {
            next(err);
        }
    },

    validateAdminSignin() {
        let validations = [
            body('email').not().isEmpty().withMessage(() => { return i18n.__('emailRequired') }),
            body('password').not().isEmpty().withMessage(() => { return i18n.__('passwordRequired') }),
            body('type').not().isEmpty().withMessage(() => { return i18n.__('typeIsRequired') })
                .isIn(['ADMIN', 'SUB_ADMIN']).withMessage(() => { return i18n.__('userTypeWrong') }),
        ];
        return validations;
    },

    async adminSignIn(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            let query = { deleted: false, type: {$in:[validatedBody.type,'PROVIDER','SUB_ADMIN']}  };
            query.email = (validatedBody.email || '').trim().toLowerCase();
            let user = await User.findOne(query)
            if (user) {
                await user.isValidPassword(validatedBody.password, async function (err, isMatch) {
                    if (err) {
                        next(err)
                    }
                    if (isMatch) {
                        if (!user.activated) {
                            return next(new ApiError(403, i18n.__('accountStop')));
                        }
                        res.status(200).send({ user, token: generateToken(user.id) });
                    } else {
                        return next(new ApiError(400, i18n.__('passwordInvalid')));
                    }
                })
            } else {
                return next(new ApiError(403, i18n.__('userNotFound')));
            }
        } catch (err) {
            next(err);
        }
    },

    validateAddUserBody() {
        let validations = [
            body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('statusRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Status, { deleted: false });
                        return true;
                    }),
            body('role').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (value, { req }) => {
                    req.role = await checkExistThenGet(value, UserRole, { deleted: false });
                    return true;
                }),
            body('name').not().isEmpty().withMessage(() => { return i18n.__('nameRequired') }),
            body('email').trim().not().isEmpty().withMessage(() => { return i18n.__('emailRequired') })
                .isEmail().withMessage(() => { return i18n.__('EmailNotValid') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    if (!req.role) {
                        return false;
                    }
                    let userQuery = { email: value, deleted: false, type: req.role.type };
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('duplicated'));
                    else
                        return true;
                }),
            body('password').not().isEmpty().withMessage(() => { return i18n.__('passwordRequired') }),
            body('country').not().isEmpty().withMessage(() => { return i18n.__('countryRequired') })
                    .custom(async (value, { req }) => {
                        await checkExist(value, User, { deleted: false });
                        return true;
                    }),
            body('phone').not().isEmpty().withMessage(() => { return i18n.__('PhoneIsRequired') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    if (!req.role) {
                        return false;
                    }
                    let userQuery = { phone: value, deleted: false, type: req.role.type };
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('duplicated'));
                    else
                        return true;
                }),
            // body('type').not().isEmpty().withMessage(() => { return i18n.__('typeIsRequired') })
            //     .isIn(['ADMIN', 'SUB_ADMIN', 'CLIENT']).withMessage(() => { return i18n.__('userTypeWrong') }),
            body('countryCode').optional().not().isEmpty().withMessage(() => { return i18n.__('countryCodeRequired') }),
            body('countryKey').optional().not().isEmpty().withMessage(() => { return i18n.__('countryKeyRequired') })
        ];
        return validations;
    },
    //////////////////////////////////////////////////////////  

    validateAdminChangeUser() {
        let validations = [
            body('userId').not().isEmpty().withMessage(() => { return i18n.__('userIdRequired') }),
            body('name').optional().not().isEmpty().withMessage(() => { return i18n.__('nameRequired') }),
            body('email').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('emailRequired') })
                .isEmail().withMessage(() => { return i18n.__('EmailNotValid') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    let userQuery = { email: value, deleted: false, _id: { $ne: req.body.userId } };
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('emailDuplicated'));
                    else
                        return true;
                }),
            body('password').optional().not().isEmpty().withMessage(() => { return i18n.__('passwordRequired') }),
            body('country').optional().not().isEmpty().withMessage(() => { return i18n.__('countryRequired') })
                    .custom(async (value, { req }) => {
                        await checkExist(value, User, { deleted: false });
                        return true;
                    }),
            body('phone').optional().not().isEmpty().withMessage(() => { return i18n.__('PhoneIsRequired') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    let userQuery = { phone: value, deleted: false, _id: { $ne: req.body.userId } };

                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('phoneIsDuplicated'));
                    else
                        return true;
                }),
            body('language').optional().not().isEmpty().withMessage(() => { return i18n.__('languageRequired') }),
            body('notification').optional().not().isEmpty().withMessage(() => { return i18n.__('notificationRequired') }),
            body('countryCode').optional().not().isEmpty().withMessage(() => { return i18n.__('countryCodeRequired') }),
            body('countryKey').optional().not().isEmpty().withMessage(() => { return i18n.__('countryKeyRequired') }),
        ];

        return validations;
    },

    async addUser(req, res, next) {
        try {
            let user = req.user;
            if (!['ADMIN','SUB_ADMIN'].includes(user.type)) {
                return next(new ApiError(401, 'غير مسموح'))
            }
            const validatedBody = checkValidations(req);
            console.log(validatedBody,'validatedBody')
            validatedBody.type = req.role.type;
            if (validatedBody.email) {
                validatedBody.email = (validatedBody.email.trim()).toLowerCase();
            }

            if (req.file) {
                let image = handleImg(req, { attributeName: 'image', isUpdate: false });
                validatedBody.image = image;
            }
            let createdUser = await User.create(validatedBody);
            createdUser = await User.schema.methods.toJSONLocalizedOnly(createdUser, i18n.getLocale());
            res.status(200).send({ user: createdUser });
        } catch (error) {
            next(error)
        }
    },

    async userInformation(req, res, next) {
        try {
            let userId = req.query.userId;
            let { removeLanguage } = req.query;

            if (!userId) userId = req.user.id;
            let user = await checkExistThenGet(userId, User, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());

            }
            res.status(200).send({ user: user });
        } catch (error) {
            next(error);
        }
    },

    async adminUpdateUser(req, res, next) {
        try {
            if (!['ADMIN','SUB_ADMIN'].includes(req.user.type)) {
                return next(new ApiError(401, 'غير مسموح'))
            }
            let data = {}
            let validatedBody = checkValidations(req);

            if (validatedBody.email) validatedBody.email = (validatedBody.email.trim()).toLowerCase();
            let user = await checkExistThenGet(validatedBody.userId, User, { deleted: false });
            if (validatedBody.password) {
                const salt = bcrypt.genSaltSync();
                validatedBody.password = await bcrypt.hash(validatedBody.password, salt);
            }
            if (req.file) {
                let image = handleImg(req, { attributeName: 'image', isUpdate: false });
                validatedBody.image = image;
            }
            if (validatedBody.location && validatedBody.location.lat && validatedBody.location.lat) {
                data.geoLocation = { type: 'Point', coordinates: [validatedBody.location.long, validatedBody.location.lat] }
                delete validatedBody.location;
            }
            validatedBody = dotObject.dot(validatedBody);
            user = await User.findOneAndUpdate({ deleted: false, _id: validatedBody.userId }, { ...validatedBody, ...data }, { new: true })
            user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());
            res.status(200).send(user);
        } catch (error) {
            next(error);
        }
    },

    validateDeleteUserAccount() {
        let validations = [
            body('userId').not().isEmpty().withMessage(() => { return i18n.__('userIdRequired') }),
        ];
        return validations;
    },

    async deleteUserAccount(req, res, next) {
        try {
            let userId = checkValidations(req).userId;
            let user = await checkExistThenGet(userId, User, { deleted: false });
            user.deleted = true;
            await user.save();
            notificationNSP.to('room-' + userId).emit(socketEvents.LogOut, { user })
            res.status(200).send('Deleted Successfully');
        } catch (error) {
            next(error);
        }
    },

    validateAdminActivateUser() {
        let validations = [
            body('activated').not().isEmpty().withMessage(() => { return i18n.__('activatedRequired') }).isBoolean().withMessage(() => { return i18n.__('activatedValueError') }),
            body('userId').not().isEmpty().withMessage(() => { return i18n.__('userIdRequired') })
        ];
        return validations;
    },

    async adminActivateUser(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            let authUser = req.user;

            if (!['ADMIN','SUB_ADMIN'].includes(authUser.type)) {
                return next(new ApiError(401, 'غير مسموح'))
            }
            await checkExist(validatedBody.userId, User, { deleted: false });
            let newUser = await User.findByIdAndUpdate(validatedBody.userId, { activated: validatedBody.activated }, { new: true });
            if (newUser.activated == false) {
                notificationNSP.to('room-' + validatedBody.userId).emit(socketEvents.LogOut, { newUser })
            }
            if (newUser.activated == false && newUser.type == 'SUB_ADMIN') {
                adminNSP.to('room-' + validatedBody.userId).emit(socketEvents.LogOut, { newUser })
            }
            res.status(200).send(newUser);
        } catch (error) {
            next(error);
        }
    },

    validateDeleteFromArchive() {
        let validations = [
            body('ids').not().isEmpty().withMessage(() => { return i18n.__('idsRequired') }).isArray()
                .withMessage(() => { return i18n.__('mustBeArray') })
        ];
        return validations;
    },

    async deleteFromArchive(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            let ids = checkValidations(req).ids;
            await User.deleteMany({ _id: { $in: ids } })
            res.status(200).send('Deleted Successfully from archive');
        } catch (error) {
            next(error);
        }
    },

    async uploadImage(req, res, next) {
        try {
            let productImage = await handleImg(req, { attributeName: 'image', isUpdate: false });
            res.status(200).send({ link: productImage });
        } catch (error) {
            next(error);
        }
    },

    count,

    /////////////////////////////////////////////////////////////
    validateAddWallet() {
        return [
            body('operationType').not().isEmpty().withMessage(() => { return i18n.__('operationTypeRequired') })
                .isIn(['SUM', 'SUBTRACT']).withMessage(() => { return i18n.__('invalidOperationType') }),
            body('description').optional().not().isEmpty().withMessage(() => { return i18n.__('descriptionRequired') }),
            body('description.en').optional().not().isEmpty().withMessage(() => { return i18n.__('arDescriptionRequired') }),
            body('description.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('enDescriptionRequired') }),
            body('money').not().isEmpty().withMessage(() => { return i18n.__('crystalsRequired') })
                .isInt({ min: 1 }),
            body('ids').not().isEmpty().withMessage(() => { return i18n.__('idsRequired') }),
            body('ids.*').optional().not().isEmpty().withMessage(() => { return i18n.__('idsRequired') })

        ]
    },

    async addWallet(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            let number = Number(validatedBody.money);
            let users = [];
            users = await User.find({ deleted: false, _id: { $in: validatedBody.ids } });
            if (users.length != validatedBody.ids.length) {
                return next(new ApiError(404, i18n.__('userNotFound')))
            }


            let description = {
                en: (validatedBody.operationType == 'SUM') ? `Admin added ${number} ryal to your wallet.` : `Admin deducted ${number} ryal from your wallet.`,
                ar: (validatedBody.operationType == 'SUM') ?
                    `   تم اضافة مبلغ ${number} ريال الي محفظتك ` :
                    ` تم خصم مبلغ ${number}  ريال من محفظتك `
            }



            if (validatedBody.description) {
                description.en = description.en + `\n ` + validatedBody.description.en;
                description.ar = description.ar + `\n ` + validatedBody.description.ar;
            }

            users.forEach(async (user) => {
                if (validatedBody.operationType == 'SUM') {
                    user.wallet = user.wallet + number
                    user.walletAdded = user.walletAdded + number;
                } else {
                    user.wallet = user.wallet - number;
                    user.walletSubtracted = user.walletSubtracted + number;
                }

                await user.save();
                userController.updateUserSocket(user.id, user);
                // notificationNSP.to('room-' + user.id).emit(socketEvents.NewUser, { user:user });
                await notificationController.create(req.user.id, user.id, description, user.id, 'ADDED_TO_WALLET');
                await notificationController.pushNotification(user.id, 'ADDED_TO_WALLET', user.id, description);
            });
            res.status(200).send({ message: 'Done' });
        } catch (error) {
            next(error);
        }
    },
    ///////////////////////////////////////////////////////////////

    validateResetWallet() {
        return [
            body('id').not().isEmpty().withMessage(() => { return i18n.__('idRequired') })
        ]
    },

    async resetWallet(req, res, next) {
        try {
            let user = req.user;
            if ((user.type != 'ADMIN') && (user.type != 'SUB_ADMIN')) {
                return next(new ApiError(403, i18n.__('unauth')));
            }
            let validatedBody = checkValidations(req);
            let client = await checkExistThenGet(validatedBody.id, User, { deleted: false });
            client.wallet = 0;
            await client.save();
            userController.updateUserSocket(client.id, client);


            let description = {
                en: 'The admin reviewed the dues',
                ar: 'قام الادمن بمراجعت المستحقات'
            }

            await notificationController.create(req.user.id, user.id, description, user.id, 'ADDED_TO_WALLET');
            await notificationController.pushNotification(user.id, 'ADDED_TO_WALLET', user.id, description);
            res.status(200).send({ client });
        } catch (error) {
            next(error);
        }
    },

    ///////////////////////////////////////////////////////////////

    validateAddPoints(){
        return [
            body('operationType').not().isEmpty().withMessage(() => { return i18n.__('operationTypeRequired') })
                .isIn(['SUM','SUBTRACT']).withMessage(() => { return i18n.__('invalidOperationType') }),
            body('description').optional().not().isEmpty().withMessage(() => { return i18n.__('descriptionRequired') }),
            body('description.en').optional().not().isEmpty().withMessage(() => { return i18n.__('arDescriptionRequired') }),
            body('description.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('enDescriptionRequired') }),
            body('points').not().isEmpty().withMessage(() => { return i18n.__('pointsRequired') })
                .isInt({min:1}),
            body('ids').not().isEmpty().withMessage(() => { return i18n.__('idsRequired') }),
            body('ids.*').optional().not().isEmpty().withMessage(() => { return i18n.__('idsRequired') })
               
        ]
    },

    async addPoints(req, res, next){
        try {
            let validatedBody = checkValidations(req);
            let number = Number(validatedBody.points);
            let users = [];
            users = await User.find({deleted:false,_id:{$in:validatedBody.ids}});
            if (users.length != validatedBody.ids.length) {
                return next(new ApiError(404,i18n.__('userNotFound')))
            }


            let description = {en: (validatedBody.operationType == 'SUM')? `Admin added ${number} ryal to your wallet.` : `Admin deducted ${number} ryal from your wallet.`,
                               ar: (validatedBody.operationType == 'SUM')? 
                               `   تم اضافة  ${number} نقطة الي حسابك `: 
                               ` تم خصم  ${number}  نقطة من حسابك `
                            }
            
            

            if (validatedBody.description) {
                description.en = description.en + `\n ` + validatedBody.description.en;
                description.ar = description.ar + `\n ` + validatedBody.description.ar;
            }
            
            users.forEach(async (user) => {
                if (validatedBody.operationType == 'SUM') {
                    user.points = user.points + number
                    user.pointsAdded = user.pointsAdded + number;
                }else{
                    user.points = user.points - number;
                    user.pointsSubtracted = user.pointsSubtracted + number;
                }
                
                await user.save();
                await pointsController.create(user,number,null,validatedBody.operationType);

                userController.updateUserSocket(user.id,user);
                // notificationNSP.to('room-' + user.id).emit(socketEvents.NewUser, { user:user });
                await notificationController.create(req.user.id , user.id , description ,user.id ,'ADDED_TO_WALLET');
                await notificationController.pushNotification(user.id,'ADDED_TO_WALLET',user.id,description);
            });
            res.status(200).send({message:'Done'});
        } catch (error) {
            next(error);
        }
    }
};