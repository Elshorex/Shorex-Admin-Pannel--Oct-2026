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
import dotObject from 'dot-object';
import Status from "../../models/status.model/status.model.js";
import { sendEmail ,sendHtmlEmail} from '../../services/emailMessage.service.js'
import config from "../../config.js";
import Country from "../../models/country.model/country.model.js";
import { generateEmailToken } from '../../services/generate-token.js';

let populateQuery = [
    { path: 'status', model: 'status' },
    { path: 'country', model: 'country' },
    { path: 'role', model: 'userRole' }
    
];



export default {

    validateAddUserBody() {
        let validations = [
            // body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            //         .custom(async (val) => {
            //             await checkExist(val, Status, { deleted: false });
            //             return true;
            //         }),
            body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') }),
            // body('role').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            //     .custom(async (value, { req }) => {
            //         req.role = await checkExistThenGet(value, UserRole, { deleted: false });
            //         return true;
            //     }),
            body('name').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('email').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isEmail().withMessage(() => { return i18n.__('invalid') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    let userQuery = { email: value, deleted: false, type: {$in:['PROVIDER','ADMIN']} };
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('duplicated'));
                    else
                        return true;
                }),
            body('password').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('country').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (value, { req }) => {
                        await checkExist(value,Country , { deleted: false });
                        return true;
                    }),
            body('phone').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    let userQuery = { phone: value, deleted: false, type: 'PROVIDER' };
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('duplicated'));
                    else
                        return true;
                }),
            body('contactPersonName').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('contactPersonLandline').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('address').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('nif').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            // body('products').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
        
        ];
        return validations;
    },
    //////////////////////////////////////////////////////////  

    validateAdminChangeUser() {
        let validations = [
            body('userId').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('name').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('email').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isEmail().withMessage(() => { return i18n.__('invalid') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    let userQuery = { email: value, deleted: false, _id: { $ne: req.body.userId }, type: {$in:['PROVIDER','ADMIN']}  };
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('duplicated'));
                    else
                        return true;
                }),
            body('password').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('country').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (value, { req }) => {
                        await checkExist(value, Country, { deleted: false });
                        return true;
                    }),
            body('phone').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    let userQuery = { phone: value, deleted: false, _id: { $ne: req.body.userId } , type: 'PROVIDER'};

                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('duplicated'));
                    else
                        return true;
                }),
            body('language').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('notification').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            
            body('contactPersonName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('contactPersonLandline').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('contactPersonPhone').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('contactPersonPhone').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('address').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('nif').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('products').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
        
            // body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            //         .custom(async (val) => {
            //             await checkExist(val, Status, { deleted: false });
            //             return true;
            //         }),
             body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') }),
        ];

        return validations;
    },

    async addUser(req, res, next) {
        try {
            let user = req.user;
            if (!['ADMIN','SUB_ADMIN'].includes(user.type)) {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            const validatedBody = checkValidations(req);
            validatedBody.type = 'PROVIDER';
            validatedBody.role = config.roles[validatedBody.type];

            if (validatedBody.email) {
                validatedBody.email = (validatedBody.email.trim()).toLowerCase();
            }

            validatedBody.emailToken = generateEmailToken(validatedBody.email);
            validatedBody.emailTokenDate = new Date();
            
            let createdUser = await User.create(validatedBody);
            createdUser = await User.schema.methods.toJSONLocalizedOnly(createdUser, i18n.getLocale());
            res.status(200).send({ user: createdUser });

            let emailParams = {
                appurl:config.webUrls.forgetPassword,
                email : createdUser.email,
                token:validatedBody.emailToken,
                fName:createdUser.name,
                lName:""
            }

            sendHtmlEmail(createdUser.email,'provider-confirmation.html',emailParams,'en');


        } catch (error) {
            next(error)
        }
    },

    async userInformation(req, res, next) {
        try {
            let userId = req.query.userId;
            let { removeLanguage } = req.query;

            if (!userId) userId = req.user.id;
            let user = await checkExistThenGet(userId, User, {type: "PROVIDER", deleted: false, populate: populateQuery });
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
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            let data = {}
            let validatedBody = checkValidations(req);

            if (validatedBody.email) validatedBody.email = (validatedBody.email.trim()).toLowerCase();
            let user = await checkExistThenGet(validatedBody.userId, User, { deleted: false });
            if (validatedBody.password) {
                const salt = bcrypt.genSaltSync();
                validatedBody.password = await bcrypt.hash(validatedBody.password, salt);
            }
            
            
            user = await User.findOneAndUpdate({ deleted: false, _id: validatedBody.userId }, { ...validatedBody, ...data }, { new: true })
            user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());
            res.status(200).send(user);
        } catch (error) {
            next(error);
        }
    },

    
};