import bcrypt from 'bcryptjs';
import { body } from "express-validator";
import { checkValidations, handleImg } from '../shared.controller/shared.controller.js';
import { generateToken } from '../../utils/token.js';
import User from '../../models/user.model/user.model.js';
import City from '../../models/city.model/city.model.js';
import Country from '../../models/country.model/country.model.js';
import Region from '../../models/region.model/region.model.js';
import Area from '../../models/area.model/area.model.js';
import UserRole from '../../models/user-roles.model/user-roles.model.js';
import { checkExistThenGet, checkExist } from '../../helpers/CheckMethods.js';
import ApiError from '../../helpers/ApiError.js';
import i18n from 'i18n'
import socketEvents from '../../socketEvents.js';
import dotObject from 'dot-object';
import Status from "../../models/status.model/status.model.js";
import { sendEmail, sendHtmlEmail } from '../../services/emailMessage.service.js'
import config from "../../config.js";

let populateQuery = [
    // { path: 'status', model: 'status' },
    { path: "country", model: "country" },
    {
        path: "region",
        model: "region",
        populate: { path: "country", model: "country" }
    },
    {
        path: "city",
        model: "city",
        populate: {
            path: "region",
            model: "region",
            populate: { path: "country", model: "country" }
        }
    },
    {
        path: "areas",
        model: "area",
        populate: {
            path: "city",
            model: "city",
            populate: {
                path: "region",
                model: "region",
                populate: { path: "country", model: "country" }
            }
        }
    },
    { path: 'role', model: 'userRole' }
];


export default {

    /////////////////////////////////////////////////////////////
    // ✅ Create StoreKeeper Validation
    /////////////////////////////////////////////////////////////
    validateStoreKeeperData() {
        return [
            body('storeKeeperData.name').trim().not().isEmpty().withMessage(() => i18n.__('filedRequired')),
            body('storeKeeperData.password').not().isEmpty().withMessage(() => i18n.__('filedRequired')),
             body('storeKeeperData.bankName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
             body('storeKeeperData.iban').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
             body('storeKeeperData.contactPersonLandline').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
             body('storeKeeperData.startAt').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('storeKeeperData.email')
                .trim().not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                .isEmail().withMessage(() => i18n.__('invalid'))
                .custom(async (value) => {
                    value = value.trim().toLowerCase();
                    const userQuery = { email: value, deleted: false, type: 'STORE_KEEPER' };
                    if (await User.findOne(userQuery)) throw new Error(i18n.__('duplicated'));
                    return true;
                }),
            body('storeKeeperData.phone')
                .optional()
                .not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                .custom(async (value) => {
                    value = value.trim().toLowerCase();
                    const userQuery = { phone: value, deleted: false, type: 'STORE_KEEPER' };
                    if (await User.findOne(userQuery)) throw new Error(i18n.__('duplicated'));
                    return true;
                }),
            body('storeKeeperData.managerId')
                .not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                .custom(async (value) => {
                    value = value.trim();
                    const userQuery = { managerId: value, deleted: false, type: 'STORE_KEEPER' };
                    if (await User.findOne(userQuery)) throw new Error(i18n.__('duplicated'));
                    return true;
                }),

            // ✅ Location hierarchy
            body('storeKeeperData.country')
                .not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                .custom(async (val) => {
                    console.log(val,'country val');
                    await checkExist(val, Country, { deleted: false });
                    return true;
                }),
             body('storeKeeperData.region').notEmpty().withMessage(() => i18n.__('filedRequired'))
                .custom(async val => {
                    if (Array.isArray(val)) {
                        for (const id of val) await checkExist(id, Region, { deleted: false });
                    } else await checkExist(val, Region, { deleted: false });
                    return true;
                }),

            body('storeKeeperData.city').notEmpty().withMessage(() => i18n.__('filedRequired'))
                .custom(async val => {
                    if (Array.isArray(val)) {
                        for (const id of val) await checkExist(id, City, { deleted: false });
                    } else await checkExist(val, City, { deleted: false });
                    return true;
                }),
             body('storeKeeperData.image').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
             body('storeKeeperData.areas').isArray({ min: 1 }).withMessage(() => i18n.__('areasMustBeArray'))
                .custom(async areas => {
                    for (const id of areas) await checkExist(id, Area, { deleted: false });
                    return true;
                }),
                  body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') })
                
        ];
    },

    /////////////////////////////////////////////////////////////
    // ✅ Create StoreKeeper
    /////////////////////////////////////////////////////////////
    // async create(validatedBody) {
    //     try {
    //         validatedBody.type = 'STORE_KEEPER';
    //         validatedBody.role = config.roles[validatedBody.type];
    //         if (validatedBody.email) validatedBody.email = validatedBody.email.trim().toLowerCase();

    //         let createdUser = await User.create(validatedBody);
    //         createdUser = await User.schema.methods.toJSONLocalizedOnly(createdUser, i18n.getLocale());

    //         const emailParams = {
    //             madlolSuplier: config.webUrl,
    //             initialPassword: '',
    //             email: createdUser.email,
    //             fName: createdUser.name,
    //             lName: ""
    //         };

    //         sendHtmlEmail(createdUser.email, 'provider-confirmation.html', emailParams, 'en');
    //         return createdUser;
    //     } catch (error) {
    //         throw error;
    //     }
    // },
    async create(validatedBody, user) {
    try {
        validatedBody.type = "STORE_KEEPER";
        validatedBody.role = config.roles[validatedBody.type];

        if (user?.type === "PROVIDER") {
            validatedBody.provider = user.id;
        }

        if (validatedBody.email) {
            validatedBody.email = validatedBody.email.trim().toLowerCase();
        }

        // Normalize arrays
        validatedBody.areas = Array.isArray(validatedBody.areas)
            ? validatedBody.areas
            : (validatedBody.areas ? [validatedBody.areas] : []);

        validatedBody.city = Array.isArray(validatedBody.city)
            ? validatedBody.city
            : (validatedBody.city ? [validatedBody.city] : []);

        validatedBody.region = Array.isArray(validatedBody.region)
            ? validatedBody.region
            : (validatedBody.region ? [validatedBody.region] : []);

        // -----------------------------------------------------------------
        // 1. FIND existing ACTIVE storekeepers in these areas (DEEP POPULATED)
        // -----------------------------------------------------------------
        const existingStoreKeepers = await User.find({
            type: "STORE_KEEPER",
            deleted: false,
            status: 1,
            areas: { $in: validatedBody.areas }
        }).populate([
                { path: "country" },
                {
                    path: "region",
                    populate: { path: "country" }
                },
                {
                    path: "city",
                    populate: {
                        path: "region",
                        populate: { path: "country" }
                    }
                },
                {
                    path: "areas",
                    populate: {
                        path: "city",
                        populate: {
                            path: "region",
                            populate: { path: "country" }
                        }
                    }
                },
                { path: "role" }
            ])
            .lean();

       
        // -----------------------------------------------------------------
        // 2. CREATE NEW STOREKEEPER DOCUMENT (keep it as Mongoose doc)
        // -----------------------------------------------------------------
        let newStoreKeeper = await User.create(validatedBody);

        // -----------------------------------------------------------------
        // 3. POPULATE new storekeeper before converting to JSON
        // -----------------------------------------------------------------
            console.log(newStoreKeeper,'newStoreKeeper');   
        newStoreKeeper = await User.findById(newStoreKeeper._id).populate([
            { path: "country" },
            {
                path: "region",
                populate: { path: "country" }
            },
            {
                path: "city",
                populate: {
                    path: "region",
                    populate: { path: "country" }
                }
            },
            {
                path: "areas",
                populate: {
                    path: "city",
                    populate: {
                        path: "region",
                        populate: { path: "country" }
                    }
                }
            },
            { path: "role" }
        ]);

        // Convert to localized JSON
        // newStoreKeeper = User.schema.methods.toJSONLocalizedOnly(
        //     newStoreKeeper,
        //     i18n.getLocale()
        // );

        // -----------------------------------------------------------------
        // 4. Email notification
        // -----------------------------------------------------------------
        const emailParams = {
            madlolSuplier: config.webUrl,
            initialPassword: "",
            email: newStoreKeeper.email,
            fName: newStoreKeeper.name,
            lName: ""
        };
        sendHtmlEmail(newStoreKeeper.email, "provider-confirmation.html", emailParams, "en");

        // -----------------------------------------------------------------
        // 5. Return everything needed by Warehouse.create
        // -----------------------------------------------------------------
        return { newStoreKeeper};

    } catch (error) {
        throw error;
    }
},


//     async create(validatedBody, user) {
//     try {
//         validatedBody.type = 'STORE_KEEPER';
//         validatedBody.role = config.roles[validatedBody.type];

//         if (user?.type === "PROVIDER") {
//             validatedBody.provider = user.id;
//         }

//         if (validatedBody.email) {
//             validatedBody.email = validatedBody.email.trim().toLowerCase();
//         }

//         // Normalize areas
//         validatedBody.areas = Array.isArray(validatedBody.areas)
//             ? validatedBody.areas
//             : (validatedBody.areas ? [validatedBody.areas] : []);

//         // ------------------------------------------------------------
//         // 1. CHECK for existing active storekeepers in same areas
//         // ------------------------------------------------------------
//         const oldStoreKeepers = await User.find({
//             type: "STORE_KEEPER",
//             deleted: false,
//             status: 1,
//             areas: { $in: validatedBody.areas }
//         }).lean();

//         let conflictMessage = null;

//         if (oldStoreKeepers.length > 0) {
//             conflictMessage =
//                 "Storekeeper already active for these areas. You need to deactivate them first.";
//         }

//         // ------------------------------------------------------------
//         // 2. Create the NEW StoreKeeper
//         // ------------------------------------------------------------
//         let createdUser = await User.create(validatedBody);
//         createdUser = await User.schema.methods.toJSONLocalizedOnly(createdUser, i18n.getLocale());

//         const emailParams = {
//             madlolSuplier: config.webUrl,
//             initialPassword: '',
//             email: createdUser.email,
//             fName: createdUser.name,
//             lName: ""
//         };

//         sendHtmlEmail(createdUser.email, 'provider-confirmation.html', emailParams, 'en');

//         // Return extended info (needed for warehouse create step)
//         return {
//             newStoreKeeper: createdUser,
//             oldStoreKeepers,
//             conflictMessage
//         };

//     } catch (error) {
//         throw error;
//     }
// },


    /////////////////////////////////////////////////////////////
    // ✅ Update StoreKeeper Validation
    /////////////////////////////////////////////////////////////
   
    validateChangeUser() {
        return [
            body('storeKeeperData.userId').optional().not().isEmpty().withMessage(() => i18n.__('filedRequired')),
            body('storeKeeperData.name').trim().optional().not().isEmpty().withMessage(() => i18n.__('filedRequired')),
            body('storeKeeperData.password').optional().not().isEmpty().withMessage(() => i18n.__('filedRequired')),
             body('storeKeeperData.bankName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
             body('storeKeeperData.iban').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
             body('storeKeeperData.contactPersonLandline').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
             body('storeKeeperData.startAt').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
             body('storeKeeperData.phone')
                .optional()
                .not().isEmpty().withMessage(() => i18n.__('filedRequired')),
            body('storeKeeperData.managerId').optional()
                .not().isEmpty().withMessage(() => i18n.__('filedRequired')),
            body('storeKeeperData.email')
                .optional()
                .isEmail().withMessage(() => i18n.__('invalid'))
                .custom(async (value, { req }) => {
                    value = value.trim().toLowerCase();
                    const userQuery = {
                        email: value,
                        deleted: false,
                        _id: { $ne: req.body.storeKeeperData.userId },
                        type: 'STORE_KEEPER'
                    };
                    if (await User.findOne(userQuery)) throw new Error(i18n.__('duplicated'));
                    return true;
                }),
            body('storeKeeperData.region').notEmpty().optional().withMessage(() => i18n.__('filedRequired'))
                .custom(async val => {
                    if (Array.isArray(val)) {
                        for (const id of val) await checkExist(id, Region, { deleted: false });
                    } else await checkExist(val, Region, { deleted: false });
                    return true;
                }),
            body('storeKeeperData.image').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
            body('storeKeeperData.city').notEmpty().optional().withMessage(() => i18n.__('filedRequired'))
                .custom(async val => {
                    if (Array.isArray(val)) {
                        for (const id of val) await checkExist(id, City, { deleted: false });
                    } else await checkExist(val, City, { deleted: false });
                    return true;
                }),
            // ✅ Updated multiple areas validation
            // body('storeKeeperData.areas')
            //     .optional()
            //     .isArray().withMessage(() => i18n.__('areasMustBeArray'))
            //     .custom(async (areas, { req }) => {
            //         if (!areas) return true;
            //         for (let areaId of areas) {
            //             const area = await checkExist(areaId, Area, { deleted: false });
            //         }
            //         return true;
            //     }),
             body('storeKeeperData.areas').optional().isArray({ min: 1 }).withMessage(() => i18n.__('areasMustBeArray'))
                .custom(async areas => {
                    for (const id of areas) await checkExist(id, Area, { deleted: false });
                    return true;
                }),
            body('storeKeeperData.status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') })

        ];
    },

    /////////////////////////////////////////////////////////////
    // ✅ Update StoreKeeper
    /////////////////////////////////////////////////////////////
    async updateUser(req,res,next) {
        try {
                const validatedBody = req.body.storeKeeperData;
                const userId = req.body.storeKeeperData.userId;
                console.log(userId,'userId')
                if (!userId)
                    throw new ApiError(404, 'Id field required');
                validatedBody.userId = userId;
            // if (!validatedBody.userId) throw new ApiError(404, i18n.__('idFiledRequired'));
            if (validatedBody.email) validatedBody.email = validatedBody.email.trim().toLowerCase();

            let user = await checkExistThenGet(validatedBody.userId, User, { deleted: false });

            if (validatedBody.password) {
                const salt = bcrypt.genSaltSync();
                validatedBody.password = await bcrypt.hash(validatedBody.password, salt);
            }

            user = await User.findOneAndUpdate(
                { deleted: false, _id: validatedBody.userId },
                validatedBody,
                { new: true }
            );

            user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());
            res.status(200).send( user );
        } catch (error) {
            throw error;
        }
    },

    /////////////////////////////////////////////////////////////
    // ✅ Fetch StoreKeeper Info (with multiple areas)
    /////////////////////////////////////////////////////////////
    async userInformation(req, res, next) {
        try {
            let userId = req.query.userId;
            const { removeLanguage } = req.query;
            if (!userId) userId = req.user.id;

            let user = await checkExistThenGet(
                userId,
                User,
                { type: "STORE_KEEPER", deleted: false, populate: populateQuery }
            );

            if (!removeLanguage)
                user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());

            res.status(200).send({ user });
        } catch (error) {
            next(error);
        }
    }

};


