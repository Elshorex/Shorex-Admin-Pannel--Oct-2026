import bcrypt from 'bcryptjs';
import { body } from "express-validator";
import { checkValidations } from '../shared.controller/shared.controller.js';
import User from '../../models/user.model/user.model.js';
import { checkExistThenGet, checkExist } from '../../helpers/CheckMethods.js';
import i18n from 'i18n'
import Status from "../../models/status.model/status.model.js";
import Product from "../../models/product.model/product.model.js";
import Category from "../../models/category.model/category.model.js";
import Region from "../../models/region.model/region.model.js";
import config from "../../config.js";

import ConfirmationCode from '../../models/confirmationsCodes.model/confirmationscodes.model.js'
import ApiError from '../../helpers/ApiError.js';

let populateQuery = [
    { path: 'status', model: 'status' },
    { path: "country", model: "country" },
    { path: "region", model: "region", populate: { path: "country", model: "country" } },
    { path: "city", model: "city", populate: { path: "region", model: "region" } },
    { path: "areas", model: "area", populate: { path: "city", model: "city" } },
    { path: 'category', model: 'category' },
    { path: 'provider', model: 'user' },
    { path: 'role', model: 'userRole' }
];



export default {

    validateAddUserBody() {
        let validations = [
            body('provider').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, User, { deleted: false ,type:'PROVIDER'});
                        return true;
                    }),
            // body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            //         .custom(async (val) => {
            //             await checkExist(val, Status, { deleted: false });
            //             return true;
            //         }),
            body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') }),
            body('code').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (value, { req }) => {
                    
                    let userQuery = { code: value, deleted: false };
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('duplicated'));
                    else
                        return true;
                }),
            body('bussinessName').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('name').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('email').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isEmail().withMessage(() => { return i18n.__('invalid') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    let userQuery = { email: value, deleted: false, type: 'CLIENT' };
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('duplicated'));
                    else
                        return true;
                }),
            body('category').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Category, { deleted: false });
                        return true;
                    }),
            body('licenceNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (value, { req }) => {
                    value = value.trim();
                    let userQuery = { licenceNumber: value, deleted: false };
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('duplicated'));
                    else
                        return true;
                }),
            body('password').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            
            body('phone').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    let userQuery = { phone: value, deleted: false, type: 'DRIVER' };
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('duplicated'));
                    else
                        return true;
                }),
            body('joinDate').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('landlineNumber').optional().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            // body('region').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            //         .custom(async (val) => {
            //             await checkExist(val, Region, { deleted: false });
            //             return true;
            //         }),
            
            body('postalCode').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('streetName').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('buildingNumber').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('address').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('inchargePersonName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('inchargePersonPhone').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            
            body('staffInCharge').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('bankName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('iban').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('accountHolderName').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            
            body('hasDeposit').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            .isBoolean(),
            body('depositDescription').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            
            body('licenceImage').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('idImage').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('notes').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
        
        ];
        return validations;
    },
    //////////////////////////////////////////////////////////  

    validateAdminChangeUser() {
        let validations = [
            body('specialReward').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            .isArray(),
            body('specialReward.*.product').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            .custom(async (val) => {
                await checkExist(val, Product, { deleted: false });
                return true;
            }),
            body('specialReward.*.reward').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('code').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            .custom(async (value, { req }) => {
                
                let userQuery = { code: value, deleted: false, _id: { $ne: req.body.userId } };
                if (await User.findOne(userQuery))
                    throw new Error(i18n.__('duplicated'));
                else
                    return true;
            }),
            body('category').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Category, { deleted: false });
                        return true;
                    }),
            body('bussinessName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('joinDate').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('landlineNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            // body('region').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            //     .custom(async (val) => {
            //         await checkExist(val, Region, { deleted: false });
            //         return true;
            //     }),
            body('postalCode').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('streetName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('buildingNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('address').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('staffInCharge').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('accountHolderName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('hasDeposit').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            .isBoolean(),
            body('depositDescription').trim().optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            


            body('userId').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('name').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('email').optional({ checkFalsy: true }).trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isEmail().withMessage(() => { return i18n.__('invalid') }),
                // .custom(async (value, { req }) => {
                //     value = (value.trim()).toLowerCase();
                //     let userQuery = { email: value, deleted: false, _id: { $ne: req.body.userId }, type: 'DRIVER' };
                //     if (await User.findOne(userQuery))
                //         throw new Error(i18n.__('duplicated'));
                //     else
                //         return true;
                // }),
            body('password').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('phone').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    let userQuery = { phone: value, deleted: false, _id: { $ne: req.body.userId } , type: 'DRIVER'};

                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('duplicated'));
                    else
                        return true;
                }),
            body('language').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('notification').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            
            
            body('licenceNumber').optional({ checkFalsy: true }).not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            .custom(async (value, { req }) => {
                value = value.trim();
                let userQuery = { licenceNumber: value, deleted: false, _id: { $ne: req.body.userId } };

                if (await User.findOne(userQuery))
                    throw new Error(i18n.__('duplicated'));
                else
                    return true;
            }),
            body('bankName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('iban').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            
            body('licenceImage').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('idImage').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            
            body('notes').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') })
        
            // body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            //         .custom(async (val) => {
            //             await checkExist(val, Status, { deleted: false });
            //             return true;
            //         })
        ];

        return validations;
    },

    async addUser(req, res, next) {
        try {
            let user = req.user;
            
            const validatedBody = checkValidations(req);
            validatedBody.type = 'CLIENT';
            validatedBody.role = config.roles[validatedBody.type];


            if (validatedBody.hasDeposit && (!validatedBody.depositDescription)) {
                return next(new ApiError(400,i18n.__('depositDescriptionRequired')))
            }

            if (user.type == 'PROVIDER') {
                validatedBody.provider = user.id;  
            }

            if (validatedBody.email) {
                validatedBody.email = (validatedBody.email.trim()).toLowerCase();
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
            let user = await checkExistThenGet(userId, User, {type: "CLIENT", deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());
            }

            let stats = { totalAvailableReward:124 , gainedReward:100,rewardHistory:90,custody:60  };
            res.status(200).send({ user: user , statistics: stats  });
        } catch (error) {
            next(error);
        }
    },

    async adminUpdateUser(req, res, next) {
        try {
            let validatedBody = checkValidations(req);

            if (validatedBody.hasDeposit && (!validatedBody.depositDescription)) {
                return next(new ApiError(400,i18n.__('depositDescriptionRequired')))
            }else if(!validatedBody.hasDeposit){
                validatedBody.$unset = {depositDescription:-1};
                delete validatedBody.depositDescription;
            }

            if (validatedBody.email) validatedBody.email = (validatedBody.email.trim()).toLowerCase();
            let user = await checkExistThenGet(validatedBody.userId, User, { deleted: false });
            if (validatedBody.password) {
                const salt = bcrypt.genSaltSync();
                validatedBody.password = await bcrypt.hash(validatedBody.password, salt);
            }
            
            
            user = await User.findOneAndUpdate({ deleted: false, _id: validatedBody.userId }, validatedBody , { new: true })
            user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());
            res.status(200).send(user);
        } catch (error) {
            next(error);
        }
    },

    async deleteUserAccount(req, res, next) {
        try {
            let userId = req.params.customerId;
            let user = await checkExistThenGet(userId, User, { deleted: false ,type:'CLIENT',populate:populateQuery});
            

            if (user.hasDeposit) {
                return next(new ApiError(400 , i18n.__('hasDeposite')))
            }

            await ConfirmationCode.deleteMany({ email: user.email });
            user.deleted = true;
            await user.save();
            res.status(200).send({message:'Done'});
        } catch (error) {
            next(error);
        }
    },

    async getUserRewards(req, res, next) {
        try {
            let userId = req.params.customerId;
            let user = await checkExistThenGet(userId, User, { deleted: false ,type:'CLIENT',populate:populateQuery});
            

            let products = await Product.find({deleted:false});
            
            res.status(200).send({message:'Done'});
        } catch (error) {
            next(error);
        }
    }

};