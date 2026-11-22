import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { checkValidations, handleImg, fieldhandleImg } from '../shared.controller/shared.controller.js';
import { generateToken } from '../../utils/token.js';
import User from '../../models/user.model/user.model.js';
import Country from '../../models/country.model/country.model.js';
import Region from '../../models/region.model/region.model.js';
import City from '../../models/city.model/city.model.js';
import Area from '../../models/area.model/area.model.js';
import Category from '../../models/category.model/category.model.js';
import { checkExistThenGet ,checkDateFilter, checkExist} from '../../helpers/CheckMethods.js';
import ApiError from '../../helpers/ApiError.js';
import ConfirmationCode from '../../models/confirmationsCodes.model/confirmationscodes.model.js'
import { sendEmail ,sendHtmlEmail} from '../../services/emailMessage.service.js'
import Hash from "../../models/hash.model/hash.model.js"
import i18n from 'i18n'
import ApiResponse from '../../helpers/ApiResponse.js'
import socketEvents from '../../socketEvents.js'
import { twilioSend, twilioVerify } from '../../services/twilo.js'
import notifController from '../notif.controller/notif.controller.js';
import dotObject from 'dot-object';
import config from '../../config.js';
import { generateEmailToken } from '../../services/generate-token.js';
import moment from 'moment'
import { sendOtpEmail } from '../../services/sendMail.js';
import { setUserPassword } from '../../helpers/setUserPassword.js';

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

// All roles supported in OTP / forgot-password flows (includes legacy INSTITUTION)
const otpFlowUserTypes = [...new Set([...config.types, 'INSTITUTION'])];

const checkUserExistByEmail = async (email) => {
    let user = await User.findOne({ email: normalizeEmail(email), deleted: false });
    if (!user)
        throw new ApiError.BadRequest('email Not Found');
    return user;
}

/** Resolve user for password reset: OTP code, legacy emailToken, or email+type only */
async function resolveUserForPasswordReset({ email, token, code, type }) {
    const normalizedEmail = normalizeEmail(email);
    const otpValue = code != null && code !== '' ? String(code) : (token != null && token !== '' ? String(token) : null);

    if (otpValue) {
        const codeDoc = await ConfirmationCode.findOne({ email: normalizedEmail, code: otpValue });
        if (!codeDoc) {
            return { error: new ApiError(400, i18n.__('CodeFail')) };
        }
        const userQuery = { email: normalizedEmail, deleted: false };
        if (type) userQuery.type = type;
        const user = await User.findOne(userQuery);
        if (!user) {
            return { error: new ApiError(404, i18n.__('EmailNotFound')) };
        }
        await ConfirmationCode.deleteOne({ _id: codeDoc._id });
        return { user };
    }

    if (token) {
        const userQuery = {
            email: normalizedEmail,
            emailToken: token,
            deleted: false,
            type: { $in: ['PROVIDER', 'ADMIN', 'SUB_ADMIN'] },
        };
        const user = await User.findOne(userQuery);
        if (!user) {
            return { error: new ApiError(404, i18n.__('EmailNotFound')) };
        }
        return { user, clearEmailToken: true };
    }

    const userQuery = { email: normalizedEmail, deleted: false };
    if (type) userQuery.type = type;
    const user = await User.findOne(userQuery);
    if (!user) {
        return { error: new ApiError(404, i18n.__('EmailNotFound')) };
    }
    return { user };
}
let populateQuery = [
  { path: "provider", model: "user" },
//   { path: "status", model: "status" },
  { path: "category", model: "category" },
  { path: "country", model: "country" },
  { path: "region", model: "region" },
  { path: "city", model: "city" },
  { path: "areas", model: "area" },
  { path: "vehicles.vehicle", model: "vehicle" },
  { path: "specialReward.product", model: "product" },
];



const updateUserSocket = async (id, userData) => {
    try {
        let user = userData ? (await User.populate(userData, populateQuery)) : await User.findById(id).populate(populateQuery);
        //user = User.schema.methods.toJSONLocalizedOnly(user, user.language || 'ar');
        // user = await this.checkUserPromo(user);
        let roomName = 'room-' + user.id;
        notificationNSP.to(roomName).emit(socketEvents.NewUser, { user: user });
        return user;
    } catch (error) {
        throw error;
    }
}

export default {

    async findAll(req, res, next) {
        try {
            
            let page = +req.query.page || 1,
            limit = +req.query.limit || 20;
            let { id, all, name, type, phone, email, activated, archive, country, category, status,
                vehicle,startFrom,startTo,
                provider,hasNoProvider,hasProvider,
                bussinessName,licenceNumber,
                fromJoiningDate , toJoiningDate
                
            } = req.query;
            
            let query = { deleted: false };
            let sortQuery = { createdAt: -1 };
            
            checkDateFilter(req,query,sortQuery,true);
            console.log("Finding all users")

            if (hasNoProvider) query.provider = null;
            if (hasProvider) query.provider = {$ne:null};
            if (provider) {
                query.provider = provider;
            }

            if (fromJoiningDate && toJoiningDate) {
                let startOfDate = moment(fromJoiningDate).startOf('day');
                let endOfDate = moment(toJoiningDate).endOf('day');
                query.startAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }

            } else if (toJoiningDate && !fromJoiningDate) {
                let endOfDate = moment(toJoiningDate).endOf('day');
                query.startAt = { $lte: new Date(endOfDate)  }

            } else if (fromJoiningDate && !toJoiningDate) {
                let startOfDate = moment(fromJoiningDate).startOf('day');
                query.startAt = { $gte: new Date(startOfDate)   }
                
            }

            if (req.query.area) query.areas = req.query.area;
            if (req.query.areas) query.areas = { $in: req.query.areas };
            if (id) {
                query._id = Number(id);
            }
            if (vehicle) query['vehicles.vehicle'] = vehicle;
            if (archive) query.deleted = true;
            if (status) query.status = status;
            if (name) {
                query.$or = [
                    {name : { '$regex': name, '$options': 'i' }},
                    {bussinessName : { '$regex': name, '$options': 'i' }},
                    {licenceNumber : { '$regex': name, '$options': 'i' }}
                ]
            } 
            if (phone) query.phone = { '$regex': phone, '$options': 'i' };
            if (email) query.email = { '$regex': email, '$options': 'i' };
            if (bussinessName) query.bussinessName = { '$regex': bussinessName, '$options': 'i' };
            if (licenceNumber) query.licenceNumber = { '$regex': licenceNumber, '$options': 'i' };
            if (type){
                query.type = type;
            } 
            
            if (activated) query.activated = activated;
            if (country) {
                query.country = country;
            }
            if (category) query.category = category;

            let users;
            let pageCount;
            // const userCount = await User.count(query);
            const userCount = await User.countDocuments(query);
            
            console.log('user query ',query);
            
            if (all) {
                users = await User.find(query).populate(populateQuery).sort(sortQuery);
                pageCount = 1;
            } else {
                users = await User.find(query).populate(populateQuery).sort({ _id: -1 }).limit(limit).skip((page - 1) * limit);
                pageCount = Math.ceil(userCount / limit);
            }

            users = User.schema.methods.toJSONLocalizedOnly(users, i18n.getLocale());
            res.send(new ApiResponse(users, page, pageCount, limit, userCount, req));
        } catch (error) {
            next(error)
        }
    },

    validateUserSignin() {
        let validations = [
            body('phone').optional().not().isEmpty().withMessage(() => { return i18n.__('usernameOrPhoneRequired') }),
            body('email').optional().not().isEmpty().withMessage(() => { return i18n.__('usernameOrPhoneRequired') }),
            body('password').not().isEmpty().withMessage(() => { return i18n.__('passwordRequired') }),
            body('type').not().isEmpty().withMessage(() => { return i18n.__('typeIsRequired') })
                .isIn(['CLIENT', 'INSTITUTION', 'DRIVER','STORE_KEEPER']).withMessage(() => { return i18n.__('userTypeWrong') }),
        ];
        return validations;
    },

    // async signIn(req, res, next) {
    //     try {
    //         const validatedBody = checkValidations(req);

    //         if (!(validatedBody.phone || validatedBody.email)) {
    //             return next(new ApiError(400, i18n.__('emailRequired')));
    //         }

    //         let query = { deleted: false, type: validatedBody.type, socialMediaType: 'NORMAL' };
    //         // if (validatedBody.type != 'CLIENT') query.status = 'ACCEPTED';
    //         if (validatedBody.countryCode) query.countryCode = validatedBody.countryCode;

    //         if (validatedBody.phone) {
    //             query.phone = validatedBody.phone.trim();
    //         }
    //         if (validatedBody.email) {
    //             query.email = validatedBody.email.trim().toLowerCase();
    //         }
    //         let user = await User.findOne(query).populate(populateQuery);
    //         if (user) {
    //             if (!user.activated) {
    //                 return next(new ApiError(404, i18n.__('notActive')));
    //             }
    //             if (!user.password) {
    //                 return next(new ApiError(404, i18n.__('invalidPassword')));
    //             }
    //             if (user.status == 'WAITING') {
    //                 return next(new ApiError(404, i18n.__('waitingAccaptance')));
    //             }
    //             await user.isValidPassword(validatedBody.password, async function (err, isMatch) {
    //                 if (err) {
    //                     next(err)
    //                 } else if (isMatch) {
    //                     if (!user.activated) {
    //                         return next(new ApiError(403, i18n.__('accountStop')));
    //                     }

    //                     // user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());
    //                     return res.status(200).send({ user, token: generateToken(user.id) });
    //                 } else {
    //                     return next(new ApiError(400, i18n.__('passwordInvalid')));
    //                 }
    //             })
    //         } else {
    //             return next(new ApiError(403, i18n.__('userNotFound')));
    //         }
    //     } catch (err) {
    //         next(err);
    //     }
    // },
            async signIn(req, res, next) {
                try {
                    const validatedBody = checkValidations(req);
                    console.log(validatedBody,'validateBody')
                    if (!(validatedBody.phone || validatedBody.email)) {
                        return next(new ApiError(400, i18n.__('emailRequired')));
                    }

                    let query = { type: validatedBody.type, socialMediaType: 'NORMAL', deleted: false };
                    if (validatedBody.countryCode) query.countryCode = validatedBody.countryCode;

                    if (validatedBody.phone) query.phone = validatedBody.phone.trim();
                    if (validatedBody.email) query.email = validatedBody.email.trim().toLowerCase();

                    let user = await User.findOne(query).populate(populateQuery);
                    // console.log(user,'user')
                    if (user) {
                        // Check if account is deleted
                        if (user.deleted === true) {
                            return next(new ApiError(403, i18n.__('accountDoesNotExist')));
                        }

                        // Check if account is inactive
                        if (user.status === 0) {
                            return next(new ApiError(403, i18n.__('accountIsInactive')));
                        }

                        if (!user.password) {
                            return next(new ApiError(404, i18n.__('invalidPassword')));
                        }
                        if (user.status == 'WAITING') {
                            return next(new ApiError(404, i18n.__('waitingAccaptance')));
                        }

                        await user.isValidPassword(validatedBody.password, async function (err, isMatch) {
                            if (err) {
                                next(err);
                            } else if (isMatch) {
                                return res.status(200).send({ user, token: generateToken(user.id) });
                            } else {
                                return next(new ApiError(400, i18n.__('passwordInvalid')));
                            }
                        });
                    } else {
                        return next(new ApiError(403, i18n.__('userNotFound')));
                    }
                } catch (err) {
                    next(err);
                }
            },

        validateUserCreateBody() {
            let validations = [

                body('avatar').optional().not().isEmpty().withMessage(() => { return i18n.__('avatarRequired') })
                .isIn(["MALE","FEMALE"]).withMessage(() => { return i18n.__('invalidAvatar') }),
                body('name').not().isEmpty().withMessage(() => { return i18n.__('nameRequired') })
                    .custom(async (value, { req }) => {
                        value = (value.trim());
                        let userQuery = { username: value, deleted: false };
                        if (await User.findOne(userQuery))
                            throw new Error(i18n.__('usernameDuplicated'));
                        return true;
                    }),
                body('email').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('emailRequired') })
                    .isEmail().withMessage(() => { return i18n.__('EmailNotValid') })
                    .custom(async (value, { req }) => {
                        value = (value.trim()).toLowerCase();
                        let userQuery = { email: value, deleted: false, type: 'CLIENT' };
                        if (await User.findOne(userQuery))
                            throw new Error(i18n.__('emailDuplicated'));
                        return true;
                    }),
                body('bussinessName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('lastName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('location').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('bankName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('postalCode').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('iban').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('accountHolderName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('landlineNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('licenceNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('inchargePersonName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('inchargePersonPhone').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('notes').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('licenceImage').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('image').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('category').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                                        .custom(async (val) => {
                                            await checkExist(val, Category, { deleted: false });
                                            return true;
                                        }),
                body('password').not().isEmpty().withMessage(() => { return i18n.__('passwordRequired') }),
                body('phone').not().isEmpty().withMessage(() => { return i18n.__('PhoneIsRequired') }).custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    let userQuery = { phone: value, deleted: false, type: 'CLIENT' };
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('phoneDuplicated'));
                    return true;
                }),
                body('countryCode').optional().not().isEmpty().withMessage(() => { return i18n.__('countryCodeRequired') }),
                body('countryKey').optional().not().isEmpty().withMessage(() => { return i18n.__('countryKeyRequired') }),
            
                // ✅ New validations for location fields
                                body('country').not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                                    .custom(async (val) => {
                                        await checkExist(val, Country, { deleted: false });
                                        return true;
                                    }),
                    
                                body('region').isArray({ min: 1 }).not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                                    .custom(async (val) => {
                                        await checkExist(val, Region, { deleted: false });
                                        return true;
                                    }),
                    
                                body('city').isArray({ min: 1 }).not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                                    .custom(async (vals) => {
                                        for (const val of vals) {
                                            await checkExist(val, City, { deleted: false });
                                        }
                                        return true;
                                    }),

                                body('areas').isArray({ min: 1 }).not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                                    .custom(async (vals) => {
                                        for (const val of vals) {
                                            await checkExist(val, Area, { deleted: false });
                                        }
                                        return true;
                                    }),
                body('type').optional().isIn(['CLIENT', 'PROVIDER', 'DRIVER', 'STORE_KEEPER']).withMessage(() => i18n.__('invalidUserType')),
                body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') })

            ];
            return validations;
        },
        
        async userSignUp(req, res, next) {
            try {
                const validatedBody = checkValidations(req);
                if (validatedBody.email)
                validatedBody.email = validatedBody.email.trim().toLowerCase();

                let country = await checkExistThenGet(validatedBody.country, Country, { deleted: false });
                let region = await checkExistThenGet(validatedBody.region[0], Region, { deleted: false });
                let city = await checkExistThenGet(validatedBody.city[0], City, { deleted: false });
                let areas = await checkExistThenGet(validatedBody.areas[0], Area, { deleted: false });
                if(country){
                    validatedBody.country = country
                }
                if(region){
                    validatedBody.region = region
                }
                if(city){
                    validatedBody.city = city
                }
                if(areas){
                    validatedBody.areas = areas
                }
                if (req.file) {
                const image = await handleImg(req, { attributeName: 'image', isUpdate: false });
                validatedBody.image = image;
                }

                console.log(validatedBody,'validation body')

                let createdUser = await User.create(validatedBody);
                // createdUser = await User.schema.methods.toJSONLocalizedOnly(createdUser, i18n.getLocale());


                // ✅ Send response and stop function
                res.status(200).send({
                user: createdUser,
                token: generateToken(createdUser.id),
                });

                // ✅ This will now only run if the above succeeds
                adminNSP.to('room-admin').emit(socketEvents.NewSignup, { user: createdUser });
                return; // <- stops any accidental fallthrough

            } catch (err) {
                // ✅ Prevent double response if headers are already sent
                if (res.headersSent) {
                console.error("⚠️ Headers already sent, skipping next(err)");
                return;
                }
                next(err);
            }
        },


//  async userSignUp(req, res, next) {
//     try {
//         const validatedBody = checkValidations(req);

//         if (validatedBody.email) {
//             validatedBody.email = validatedBody.email.trim().toLowerCase();
//         }

//         // Fetch full objects
//         const country = await checkExistThenGet(validatedBody.country, Country, { deleted: false });
//         const region = await checkExistThenGet(validatedBody.region[0], Region, { deleted: false });
//         const city = await checkExistThenGet(validatedBody.city[0], City, { deleted: false });
//         const area = await checkExistThenGet(validatedBody.areas[0], Area, { deleted: false });

//         validatedBody.country = country || null;
//         validatedBody.region = region ? [region] : [];
//         validatedBody.city = city ? [city] : [];
//         validatedBody.areas = area ? [area] : [];

//         // Handle image upload
//         if (req.file) {
//             const image = await handleImg(req, { attributeName: 'image', isUpdate: false });
//             validatedBody.image = image;
//         }

//         let createdUser = await User.create(validatedBody);

//         // Populate region, city, areas for response
//         const populateQuery = [
//             { path: "region", model: "region" },
//             { path: "city", model: "city" },
//             { path: "areas", model: "area" },
//             { path: "country", model: "country" },
//         ];

//         const user = await checkExistThenGet(createdUser.id, User, {
//             deleted: false,
//             populate: populateQuery,
//         });

//         // Convert region, city, areas to array of objects (keep country as object)
//         const responseUser = {
//             ...user.toObject(),
//             region: Array.isArray(user.region) ? user.region : user.region ? [user.region] : [],
//             city: Array.isArray(user.city) ? user.city : user.city ? [user.city] : [],
//             areas: Array.isArray(user.areas) ? user.areas : user.areas ? [user.areas] : [],
//         };

//         res.status(200).send({
//             user: responseUser,
//             token: generateToken(createdUser.id),
//         });

//         adminNSP.to('room-admin').emit(socketEvents.NewSignup, { user: responseUser });

//     } catch (err) {
//         if (res.headersSent) {
//             console.error("⚠️ Headers already sent, skipping next(err)");
//             return;
//         }
//         next(err);
//     }
// },

        validateCheckPhone() {
            return [
                body('phone').not().isEmpty().withMessage(() => { return i18n.__('PhoneIsRequired') })
            ]
        },
        async checkExistPhone(req, res, next) {
            try {
                let phone = checkValidations(req).phone;
                let exist = await User.findOne({ phone: phone, deleted: false });
                return res.status(200).send({ duplicated: exist ? true : false });
            } catch (error) {
                next(error);
            }
        },

        validateCheckEmail() {
            return [
                body('email').trim().not().isEmpty().withMessage(() => { return i18n.__('emailRequired') })
            ]
        },
        async checkExistEmail(req, res, next) {
            try {
                let email = checkValidations(req).email.toLowerCase();
                let exist = await User.findOne({ email: email, deleted: false });
                return res.status(200).send({ duplicated: exist ? true : false });
            } catch (error) {
                next(error);
            }
        },

        validateUserUpdate() {
            let validations = [
                body('email').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('emailRequired') })
                    .isEmail().withMessage(() => { return i18n.__('Email Not Valid') })
                    .custom(async (value, { req }) => {
                        value = (value.trim()).toLowerCase();
                        let userQuery = { _id: { $ne: req.user.id }, email: value, deleted: false, type: 'CLIENT' };
                        if (await User.findOne(userQuery))
                            throw new Error(i18n.__('emailDuplicated'));
                        else
                            return true;
                    }),
                body('phone').optional().not().isEmpty().withMessage(() => { return i18n.__('PhoneIsRequired') })
                    .custom(async (value, { req }) => {
                        value = (value.trim()).toLowerCase();
                        let userQuery = { _id: { $ne: req.user.id }, phone: value, deleted: false, type: 'CLIENT' };
                        if (await User.findOne(userQuery))
                            throw new Error(i18n.__('phoneDuplicated'));
                        else
                            return true;
                    }),
                body('lastName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('language').optional().not().isEmpty().withMessage(() => { return i18n.__('languageRequired') }).isIn(['ar', 'en']),
                body('notification').optional().not().isEmpty().withMessage(() => { return i18n.__('notificationRequired') }),
                body('newPassword').optional().not().isEmpty().withMessage(() => { return i18n.__('newPasswordRequired') }),
                body('currentPassword').optional().not().isEmpty().withMessage(() => { return i18n.__('CurrentPasswordRequired') }),
                body('countryCode').optional().not().isEmpty().withMessage(() => { return i18n.__('countryCodeRequired') }),
                body('countryKey').optional().not().isEmpty().withMessage(() => { return i18n.__('countryKeyRequired') }),
                body('location').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('image').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('avatar').optional().not().isEmpty().withMessage(() => { return i18n.__('avatarRequired') })
                .isIn(["MALE","FEMALE"]).withMessage(() => { return i18n.__('invalidAvatar') }),
                body('name').optional().not().isEmpty().withMessage(() => { return i18n.__('nameRequired') })
                    .custom(async (value, { req }) => {
                        value = (value.trim());
                        let userQuery = { username: value, deleted: false };
                        if (await User.findOne(userQuery))
                            throw new Error(i18n.__('usernameDuplicated'));
                        return true;
                    }),
                
                body('bussinessName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('bankName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('iban').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('accountHolderName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('landlineNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('licenceNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('inchargePersonName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('inchargePersonPhone').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('notes').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('licenceImage').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('category').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                                    .custom(async (val) => {
                                            await checkExist(val, Category, { deleted: false });
                                            return true;
                                        }),          
                                body('country').optional().isEmpty().withMessage(() => i18n.__('filedRequired'))
                                    .custom(async (val) => {
                                        await checkExist(val, Country, { deleted: false });
                                        return true;
                                    }),
                    
                                body('region')
                                        .optional()
                                        .isArray({ min: 1 })
                                        .withMessage(() => i18n.__('filedRequired'))
                                        .custom(async (vals) => {
                                            for (const val of vals) {
                                            await checkExist(val, Region, { deleted: false });
                                            }
                                            return true;
                                        }),

                    
                                body('city')
                                        .optional()
                                        .isArray({ min: 1 })
                                        .withMessage(() => i18n.__('filedRequired'))
                                        .custom(async (vals) => {
                                            for (const val of vals) {
                                            await checkExist(val, City, { deleted: false });
                                            }
                                            return true;
                                        }),


                            body('areas')
                                        .optional()
                                        .isArray({ min: 1 })
                                        .withMessage(() => i18n.__('filedRequired'))
                                        .custom(async (vals) => {
                                            for (const val of vals) {
                                            await checkExist(val, Area, { deleted: false });
                                            }
                                            return true;
                                        }),

            body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') })
            ];

            return validations;
        },
        async updateInfo(req, res, next) {
            try {
                let userId = req.user.id;
                let validatedBody = checkValidations(req);

                let data = {};

                if (validatedBody.workingTime) {
                    data.workingTime = validatedBody.workingTime;
                    delete validatedBody.workingTime;
                }
                if (validatedBody.category) {
                    data.category = validatedBody.category;
                    delete validatedBody.category;
                }
                if (validatedBody.subCategory) {
                    data.subCategory = validatedBody.subCategory;
                    delete validatedBody.subCategory;
                }

                let user = await checkExistThenGet(userId, User, { deleted: false });
                if (validatedBody.email) {
                    validatedBody.email = (validatedBody.email.trim()).toLowerCase();
                }
                if (req.files && req.files['image'] && req.files['image'].length > 0) {
                    validatedBody.image = (fieldhandleImg(req, { attributeName: 'image' }))[0];
                }
                if (req.files && req.files['coverImage'] && req.files['coverImage'].length > 0) {
                    let coverImage = fieldhandleImg(req, { attributeName: 'coverImage' });
                    validatedBody.coverImage = coverImage[0];
                }
                if (validatedBody.location && validatedBody.location.lat && validatedBody.location.lat) {
                    data.geoLocation = { type: 'Point', coordinates: [validatedBody.location.long, validatedBody.location.lat] }
                    delete validatedBody.location;
                }
                validatedBody = dotObject.dot(validatedBody);

                if (validatedBody.newPassword) {

                    if (validatedBody.currentPassword) {
                        if (bcrypt.compareSync(validatedBody.currentPassword, user.password)) {
                            const salt = bcrypt.genSaltSync();
                            let hash = await bcrypt.hash(validatedBody.newPassword, salt);
                            validatedBody.password = hash;
                            delete validatedBody.newPassword;
                            delete validatedBody.currentPassword;
                            user = await User.findOneAndUpdate({ deleted: false, _id: userId }, { ...validatedBody, ...data }, { new: true }).populate(populateQuery);
                            // user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());

                            res.status(200).send(user);
                            if (user.type == 'INSTITUTION' && validatedBody.institutionStatus) {
                                notificationNSP.emit(socketEvents.UpdatedTrader, { user: user });
                            }
                        } else {
                            return next(new ApiError(403, i18n.__('currentPasswordInvalid')))
                        }
                    } else {
                        return res.status(400).send({
                            error: [{
                                location: 'body',
                                param: 'currentPassword',
                                msg: i18n.__('CurrentPasswordRequired')
                            }]
                        });
                    }
                } else {
                    user = await User.findOneAndUpdate({ deleted: false, _id: userId }, { ...validatedBody, ...data }, { new: true }).populate(populateQuery);
                    // user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());

                    res.status(200).send(user);
                    if (user.type == 'INSTITUTION') {
                        if (validatedBody.institutionStatus) {
                            notificationNSP.emit(socketEvents.UpdatedTrader, { user: user });
                        }
                        if (data.geoLocation) {
                            let description = { en: `${req.user.name} \n updated his location.`, ar: ` ${req.user.name} \n  قام المتجر بتغير موقعه` };
                            await notifController.create(req.user.id, null, description, req.user.id, 'CHANGE_LOCATION', null, true);
                            notificationNSP.emit(socketEvents.UpdatedTrader, { user: user });
                        }
                    }
                }

            } catch (error) {
                next(error);
            }
        },

        validateUpdatedPassword() {
            let validation = [
                body('newPassword').not().isEmpty().withMessage(() => { return i18n.__('newPasswordRequired') }),
                body('currentPassword').not().isEmpty().withMessage(() => { return i18n.__('CurrentPasswordRequired') }),
            ];
            return validation;
        },
        async updatePasswordFromProfile(req, res, next) {
            try {
                let validatedBody = checkValidations(req);
                let user = req.user;
                if (bcrypt.compareSync(validatedBody.currentPassword, user.password)) {
                    const salt = bcrypt.genSaltSync();
                    let hash = await bcrypt.hash(validatedBody.newPassword, salt);
                    validatedBody.password = hash;
                    delete validatedBody.newPassword;
                    delete validatedBody.currentPassword;
                    user = await User.findOneAndUpdate({ deleted: false, _id: user.id }, validatedBody, { new: true }).populate(populateQuery);
                    res.status(200).send({ user: user });
                } else {
                    return next(new ApiError(403, i18n.__('currentPasswordInvalid')))
                }
            } catch (error) {
                next(error);
            }
        },

    /////////////////////////////////////////////////////////////////////////////////////////// forget password by email
        validateForgetPassword() {
            return [
                body('email').not().isEmpty().withMessage(() => { return i18n.__('emailRequired') }),
                body('type').not().isEmpty().withMessage(() => { return i18n.__('typeIsRequired') })
                    .isIn(config.types).withMessage(() => { return i18n.__('userTypeWrong') }),
            ];
        },
        async forgetPasswordNodeMailer(req, res, next) {
            try {
                let validatedBody = checkValidations(req);
                let email = validatedBody.email;
                email = (email.trim()).toLowerCase();
                console.log(email)
                
                // let user = await User.findOne({ email: email, deleted: false, type:{$in:['PROVIDER','ADMIN']} });
                let user = await User.findOne({ email: email, deleted: false, type:{$in:['PROVIDER','ADMIN','CLIENT','DRIVER']} });
                if (!user)
                    return next(new ApiError(403, i18n.__('EmailNotFound')));

                user.emailToken = generateEmailToken(email);
                user.emailTokenDate = new Date();
                await user.save();

                let emailParams = {
                    name:user.name,
                    token:user.emailToken,
                    appurl:config.webUrls.forgetPassword,
                    email
                }
                sendHtmlEmail(email,'forget-password.html',emailParams);
                res.status(200).send({ message: i18n.__('checkYourMail')});
            } catch (err) {
                next(err);
            }
        },

    // async forgetPasswordTwilioEmail(req, res, next) {
    //     try {
    //         let validatedBody = checkValidations(req);
    //         let email = validatedBody.email;
    //         let type = validatedBody.type;
    //         email = (email.trim()).toLowerCase();
    //         console.log(email)
            
    //         // let user = await User.findOne({ email: email, deleted: false, type:{$in:['PROVIDER','ADMIN']} });
    //         let user = await User.findOne({ email: email, deleted: false, type:{$in:['PROVIDER','ADMIN','CLIENT','DRIVER']} });
    //         if (!user)
    //             return next(new ApiError(403, i18n.__('EmailNotFound')));
    //         sendOtpEmail(email, user.language || 'en');
    //         res.status(200).send({ message: i18n.__('checkYourMail')});
    //     } catch (err) {
    //         next(err);
    //     }
    // },
        async forgetPasswordTwilioEmail(req, res, next) {
            try {
                let validatedBody = checkValidations(req);
                let email = validatedBody.email.trim().toLowerCase();
                let type = validatedBody.type;  // DRIVER / CLIENT / PROVIDER / ADMIN

                // 1. Find user based on email + NOT deleted
                let user = await User.findOne({ email, deleted: false });

                if (!user) {
                    return next(new ApiError(403, i18n.__('EmailNotFound')));
                }

                // 2. Validate TYPE matches
                if (user.type !== type) {
                    return next(
                        new ApiError(
                            403,
                            i18n.__('invalidEmailType') ||
                            `Email does not belong to a ${type}.`
                        )
                    );
                }

                // 3. Everything is valid → send OTP
                await sendOtpEmail(email, user.language || 'en');

                res.status(200).send({
                    message: i18n.__('checkYourMail')
                });

            } catch (err) {
                next(err);
            }
        },

        validateConfirmCode() {
            return [
                body('email').not().isEmpty().withMessage(() => { return i18n.__('emailRequired') }),
                body('code').not().isEmpty().withMessage(() => { return i18n.__('codeRequired') }),
                body('type').not().isEmpty().withMessage(() => { return i18n.__('typeIsRequired') })
                    .isIn(otpFlowUserTypes).withMessage(() => { return i18n.__('userTypeWrong') }),
            ];
        },

         async verifyForgetPasswordCode(req, res, next) {
    try {
        let validatedBody = checkValidations(req);
        let email = normalizeEmail(validatedBody.email);
        let code = String(validatedBody.code);
        let type = validatedBody.type;

        let user = await User.findOne({ email, deleted: false, type });
        if (!user) {
            return next(
                new ApiError(
                    403,
                    i18n.__('invalidEmailType') || `Email does not belong to a ${type}.`
                )
            );
        }

        let codeDoc = await ConfirmationCode.findOne({ code, email });

        if (codeDoc) {
            // Keep code until password is reset (resetPassword deletes it)
            return res.status(200).send({ message: i18n.__('CodeSuccess'), verified: true });
        } else {
            return res.status(400).send({ errors: i18n.__('CodeFail') });
        }
    } catch (err) {
        next(err);
    }
        },

        async updatePassword(req, res, next) {
            try {
                let validatedBody = checkValidations(req);
                const { user, error, clearEmailToken } = await resolveUserForPasswordReset({
                    email: validatedBody.email,
                    token: validatedBody.token,
                    code: validatedBody.code,
                    type: validatedBody.type,
                });
                if (error) return next(error);

                await setUserPassword(user, validatedBody.newPassword);
                if (clearEmailToken) {
                    await User.updateOne(
                        { _id: user._id },
                        { $unset: { emailToken: 1, emailTokenDate: 1 } }
                    );
                }
                const populated = await User.findById(user._id).populate(populateQuery);
                res.status(200).send({
                    user: populated,
                    token: generateToken(user.id),
                });
            } catch (err) {
                next(err);
            }
        },
        ////////////////////////////////////////////////////////////////////////// forget password by phone
        validateForgetPasswordByPhone() {
            return [
                body('countryCode').optional().not().isEmpty().withMessage(() => { return i18n.__('countryCodeRequired') }),
                body('phone').not().isEmpty().withMessage(() => { return i18n.__('phoneRequired') }),
                body('type').not().isEmpty().withMessage(() => { return i18n.__('typeIsRequired') })
                    .isIn(otpFlowUserTypes).withMessage(() => { return i18n.__('userTypeWrong') }),
            ];
        },
    // async forgetPasswordByPhone(req, res, next) {
    //     try {
    //         let validatedBody = checkValidations(req);
    //         let phone = validatedBody.phone;
    //         // phone = phone.trim()
    //         console.log(phone,'phone')
    //         // let user = await User.findOne({ phone: phone, deleted: false, type: validatedBody.type, countryCode: validatedBody.countryCode });
    //         let user = await User.findOne({ phone: phone, deleted: false, type: validatedBody.type});
    //         if (!user)
    //             return next(new ApiError(403, i18n.__('userNotFound')));
    //         twilioSend(phone, user.language || 'ar');
    //         res.status(200).send(i18n.__('checkYourPhone'));
    //     } catch (err) {
    //         next(err);
    //     }
    // },
        async forgetPasswordByPhone(req, res, next) {
            try {
                const validatedBody = checkValidations(req);
                const { phone, type } = validatedBody;
                const formattedPhone = phone.startsWith('+') ? phone.trim() : `+${phone.trim()}`;
                console.log('📞 Sending OTP to:', formattedPhone);
                const user = await User.findOne({ phone: formattedPhone, deleted: false, type });
                if (!user) return next(new ApiError(403, i18n.__('userNotFound')));
                twilioSend(formattedPhone, user.language || 'ar');
                res.status(200).send(i18n.__('checkYourPhone'));
            } catch (err) {
                console.error('❌ forgetPasswordByPhone error:', err.message);
                next(err);
            }
        },  

        validateVerifyForgetPasswordByPhone() {
            return [
                body('code').not().isEmpty().withMessage(() => { return i18n.__('codeRequired') }),
                body('phone').not().isEmpty().withMessage(() => { return i18n.__('phoneRequired') }),
                body('countryCode').optional().not().isEmpty().withMessage(() => { return i18n.__('countryCodeRequired') }),
                body('type').not().isEmpty().withMessage(() => { return i18n.__('typeIsRequired') })
                    .isIn(otpFlowUserTypes).withMessage(() => { return i18n.__('userTypeWrong') }),
            ];
        },
        async verifyForgetPasswordByPhone(req, res, next) {
            try {
                let validatedBody = checkValidations(req);
                let phone = validatedBody.phone;
                phone = phone.trim()
                let user = await User.findOne({ phone: phone, deleted: false, type: validatedBody.type, countryCode: validatedBody.countryCode });
                if (!user)
                    return next(new ApiError(403, i18n.__('userNotFound')));
                twilioVerify( user.countryCode + phone, validatedBody.code, user, res, next);
            } catch (err) {
                next(err);
            }
        },

        validateUpdatePasswordByPhone() {
            return [
                body('password').not().isEmpty().withMessage(() => { return i18n.__('passwordRequired ') }),
                body('phone').not().isEmpty().withMessage(() => { return i18n.__('phoneRequired') }),
                body('countryCode').optional().not().isEmpty().withMessage(() => { return i18n.__('countryCodeRequired') }),
                body('type').not().isEmpty().withMessage(() => { return i18n.__('typeIsRequired') })
                    .isIn(otpFlowUserTypes).withMessage(() => { return i18n.__('userTypeWrong') }),
            ];
        },
        async updatePasswordByPhone(req, res, next) {
            try {
                let validatedBody = checkValidations(req);

                validatedBody.phone = validatedBody.phone.trim();

                // 1. Find user
                let user = await User.findOne({
                    deleted: false,
                    phone: validatedBody.phone,
                    type: validatedBody.type,
                    countryCode: validatedBody.countryCode
                });

                if (!user) {
                    return next(new ApiError(403, i18n.__('userNotFound')));
                }

                await setUserPassword(user, validatedBody.password);

                // 4. Return user + token
                res.status(200).send({
                    user,
                    token: generateToken(user.id)
                });

            } catch (err) {
                next(err);
            }
        },

    ////////////////////////////////////////////////////////////////////////////////////////// reset password

        validateResetPassword() {
            return [
                body('email').not().isEmpty().withMessage(() => { return i18n.__('emailRequired') }),
                body('newPassword').not().isEmpty().withMessage(() => { return i18n.__('newPasswordRequired') }),
                body('token').optional(),
                body('code').optional(),
                body('type')
                    .optional()
                    .isIn(otpFlowUserTypes)
                    .withMessage(() => { return i18n.__('userTypeWrong') }),
            ];
        },

        async resetPassword(req, res, next) {
            try {
                let validatedBody = checkValidations(req);

                if (!validatedBody.token && !validatedBody.code) {
                    return next(new ApiError(400, i18n.__('tokenRequired')));
                }

                const { user, error, clearEmailToken } = await resolveUserForPasswordReset({
                    email: validatedBody.email,
                    token: validatedBody.token,
                    code: validatedBody.code,
                    type: validatedBody.type,
                });
                if (error) return next(error);

                await setUserPassword(user, validatedBody.newPassword);
                if (clearEmailToken) {
                    await User.updateOne(
                        { _id: user._id },
                        { $unset: { emailToken: 1, emailTokenDate: 1 } }
                    );
                }

                res.status(200).send({
                    message: 'Updated Successfully',
                    user: await User.findById(user._id).populate(populateQuery),
                    token: generateToken(user.id),
                });
            } catch (err) {
                next(err);
            }
        },


    ////////////////////////////////////////////////////////////////////////////////////////// 
        validateAddToken() {
            let validations = [
                body('token').not().isEmpty().withMessage(() => { return i18n.__('token is required') }),
                body('type').not().isEmpty().withMessage(() => { return i18n.__('type is required') })
                    .isIn(['ios', 'android', 'web']).withMessage(() => { return i18n.__('wrong type') })
            ];
            return validations;
        },
        async addToken(req, res, next) {
            try {
                let validatedBody = checkValidations(req);
                let user = await checkExistThenGet(req.user.id, User, { deleted: false });
                let tokens = user.tokens;
                let found = false;
                for (let index = 0; index < tokens.length; index++) {
                    if (tokens[index].token == validatedBody.token) {
                        found = true
                    }
                }
                if (!found) {
                    user.tokens.push(validatedBody);
                    let q = {
                        token: validatedBody.token,
                        deleted: false
                    }
                    let doc = await Hash.findOne(q);
                    if (doc) {
                        if (req.user.id != doc.user) {
                            let newdoc = await Hash.findOneAndUpdate(q, { user: req.user.id });
                            let newUser = await User.findByIdAndUpdate(doc.user, { $pull: { tokens: { token: validatedBody.token } } }, { new: true });
                        }
                    } else {
                        await Hash.create({ token: validatedBody.token, user: req.user.id });
                    }
                    await user.save();
                }
                res.status(200).send({ user });
            } catch (err) {
                next(err);
            }
        },

    validateLogout() {
        return [
            body('token').not().isEmpty().withMessage('tokenRequired')
        ];
    },
    async logout(req, res, next) {
        try {
            let token = req.body.token;
            let user = await checkExistThenGet(req.user._id, User, { deleted: false });

            let tokens = [];
            for (let i = 0; i < user.tokens.length; i++) {
                if (user.tokens[i].token != token) {
                    tokens.push(user.tokens[i]);
                }
            }
            user.tokens = tokens;
            user.workStatus = 'OFFLINE';
            user.logedIn = false;
            await user.save();
            res.status(200).send(await checkExistThenGet(req.user._id, User, { deleted: false }));
        } catch (err) {
            next(err)
        }
    },

    async userInformation(req, res, next) {
        try {
            let userId = req.query.userId;
            let { removeLanguage } = req.query;
            let user = await checkExistThenGet(userId, User, { deleted: false, populate: populateQuery });
             if (!removeLanguage) {
                user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());
             }
            res.status(200).send({ user: user });
        } catch (error) {
            next(error);
        }
    },
    async deleteAccount(req, res, next) {
        try {
            let user = await checkExistThenGet(req.user.id, User, { deleted: false });
            user.deleted = true;
            await user.save();
            await ConfirmationCode.deleteMany({ email: user.email });
            res.status(200).send('Deleted Successfully');
        } catch (error) {
            next(error);
        }
    },

    async deleteAccountForCustomer(req, res, next) {
        try {
            let user = await checkExistThenGet(req.user.id, User, { deleted: false });
            
            const allowedRoles = ['CLIENT', 'DRIVER', 'STORE_KEEPER'];
            if (!allowedRoles.includes(user.type)) {
                return next(new ApiError(403, i18n.__('unauthrized')));
            }
            
            user.deleted = true;
            user.tokens = [];
            await user.save();
            
            res.status(200).send({ 
                success: true, 
                message: i18n.__('accountDeletedSuccessfully') 
            });
        } catch (error) {
            next(error);
        }
    },

    validateOpenActiveChatHead() {
        return [
            body('friend').not().isEmpty().withMessage('friendRequired')
        ];
    },

    async openActiveChatHead(req, res, next) {
        try {
            let body = checkValidations(req);
            let friend = await checkExistThenGet(body.friend, User, { deleted: false });
            let user = req.user;
            let newUser = await User.findByIdAndUpdate(user.id, { activeChatHead: friend.id }, { new: true });
            res.status(200).send({ user: newUser });
        } catch (error) {
            next(error);
        }
    },

    async closeActiveChatHead(req, res, next) {
        try {
            let user = req.user;
            user.activeChatHead = undefined;
            await user.save()
            res.status(200).send({ user: user });

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
            await ConfirmationCode.deleteMany({ email: user.email });
            user.deleted = true;
            await user.save();
            res.status(200).send('Deleted Successfully');
        } catch (error) {
            next(error);
        }
    },

    validateSocialMediaLogin() {
        let validations = [
            body('email').optional().not().isEmpty().withMessage(() => { return i18n.__('emailRequired') }),
            body('phone').optional().not().isEmpty().withMessage(() => { return i18n.__('PhoneIsRequired') }),
            body('name').not().isEmpty().withMessage(() => { return i18n.__('nameRequired') }),
            body('image').optional().not().isEmpty().withMessage(() => { return i18n.__('imageRequired') }),
            body('socialId').not().isEmpty().withMessage(() => { return i18n.__('socialIdRequired') }),
            body('socialMediaType').not().isEmpty().withMessage(() => { return i18n.__('socialMediaTypeRequired') }).isIn(['FACEBOOK', 'TWITTER', 'INSTAGRAM', 'GOOGLE', 'APPLE']).withMessage(() => { return i18n.__('socialMediaTypeWrong') })
        ];
        return validations;
    },
    async socialMedialLogin(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            let query = { deleted: false, type: 'CLIENT', socialId: validatedBody.socialId };

            if (validatedBody.email) {
                validatedBody.email = (validatedBody.email.trim()).toLowerCase();
                // query.email = validatedBody.email;
            }
            let user = await User.findOne(query);
            if (user) {
                res.status(200).send({ user, token: generateToken(user.id) });
            }
            else {
                let createdUser = await User.create(validatedBody);
                res.status(200).send({ user: createdUser, token: generateToken(createdUser.id) });
            }
        } catch (err) {
            next(err);
        }
    },

    validateVisitorSignUp() {
        let validations = [
            body('token').optional().not().isEmpty().withMessage(() => { return i18n.__('token is required') }),
            body('type').optional().not().isEmpty().withMessage(() => { return i18n.__('type is required') })
                .isIn(['ios', 'android', 'web']).withMessage(() => { return i18n.__('wrong type') })
        ];
        return validations;
    },

   
    ////////////////////////////Institution////////////////////////////////////////////

    
    async uploadImage(req, res, next) {
        try {
            let productImage = await handleImg(req, { attributeName: 'image', isUpdate: false });
            res.status(200).send({ link: productImage });
        } catch (error) {
            next(error);
        }
    },

    validateDeleteMulti() {
        return [
            body('ids').not().isEmpty().withMessage(() => { return i18n.__('idsRequired') }).isArray().withMessage('must be array'),
        ];
    },
    async deleteMuti(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN')
                return next(new ApiError(403, i18n.__('unauthrized')));

            let validatedBody = checkValidations(req);
            await User.updateMany({ _id: { $in: validatedBody.ids }, deleted: false }, { deleted: true, deletedDate: new Date() })
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    }, 


    


    updateUserSocket,


    /////////////////////////////////////////////////////////////////////////////////////////// check and verified phone

    validateCheckPhoneVerified() {
        return [
            body('phone').not().isEmpty().withMessage(() => { return i18n.__('phoneRequired') }),
            body('countryCode').not().isEmpty().withMessage(() => { return i18n.__('countryCodeRequired') })
        ];
    },
    async checkPhoneVerified(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            var phone = validatedBody.phone;

            let query = { phone: phone, deleted: false };
            if (req.user) query._id = { $ne: req.user.id };
            var user = await User.findOne(query);
            if (user)
                return next(new ApiError(403, i18n.__('phoneAlreadyExist')));

            await ConfirmationCode.create({...validatedBody,type:'PHONE'});

            
            twilioSend('+' + validatedBody.countryCode + phone, 'en');
            res.status(200).send(i18n.__('checkYourPhone'));

        } catch (err) {
            next(err);
        }
    },

    validatePhoneVerifiedCode() {
        return [
            body('phone').not().isEmpty().withMessage(() => { return i18n.__('phoneRequired') }),
            body('countryCode').not().isEmpty().withMessage(() => { return i18n.__('countryCodeRequired') }),
            body('code').not().isEmpty().withMessage(() => { return i18n.__('codeRequired') })
        ];
    },
    async verifyPhoneVerifiedCode(req, res, next) {
        try {
            let validatedBody = checkValidations(req);

            let phone = '+' + validatedBody.countryCode + validatedBody.phone;
            twilioVerify(phone, validatedBody.code, null, res, next,validatedBody.phone);
        } catch (err) {
            next(err);
        }
    },

    validateRequestAccountDeletion() {
        return [
            body('email').not().isEmpty().withMessage(() => i18n.__('emailRequired'))
                .isEmail().withMessage(() => i18n.__('invalidData')),
            body('reason').trim().not().isEmpty().withMessage(() => i18n.__('filedRequired')),
        ];
    },

    async requestAccountDeletion(req, res, next) {
        try {
            const { email, reason } = checkValidations(req);
            const normalizedEmail = normalizeEmail(email);
            const allowedTypes = ['CLIENT', 'DRIVER', 'STORE_KEEPER'];

            const user = await User.findOne({
                email: normalizedEmail,
                deleted: false,
                type: { $in: allowedTypes },
            });

            if (user) {
                user.deletionRequested = true;
                user.deletionRequestReason = reason.trim();
                user.deletionRequestDate = new Date();
                await user.save();

                const admins = await User.find({
                    deleted: false,
                    type: { $in: ['ADMIN', 'SUB_ADMIN'] },
                });
                const description = `Account deletion requested by ${normalizedEmail}`;
                for (const admin of admins) {
                    await notifController.create(
                        user._id,
                        admin._id,
                        description,
                        user._id,
                        'ACCOUNT_DELETION_REQUEST'
                    );
                }
            }

            res.status(200).send({
                success: true,
                message: 'Your account will be deleted within 90 days.',
            });
        } catch (error) {
            next(error);
        }
    },


};