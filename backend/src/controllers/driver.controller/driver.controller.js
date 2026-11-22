import bcrypt from 'bcryptjs';
import { body } from "express-validator";
import { checkValidations } from '../shared.controller/shared.controller.js';
import User from '../../models/user.model/user.model.js';
import { checkExistThenGet, checkExist } from '../../helpers/CheckMethods.js';
import i18n from 'i18n'
import Status from "../../models/status.model/status.model.js";
import { sendEmail ,sendHtmlEmail} from '../../services/emailMessage.service.js'
import config from "../../config.js";
import vehicleModel from '../../models/vehicle.model/vehicle.model.js';
import ApiError from '../../helpers/ApiError.js';
import ConfirmationCode from '../../models/confirmationsCodes.model/confirmationscodes.model.js'
// ✅ Import models for validations
import Country from '../../models/country.model/country.model.js';
import Region from '../../models/region.model/region.model.js';
import City from '../../models/city.model/city.model.js';
import Area from '../../models/area.model/area.model.js';
let populateQuery = [
// { path: 'status', model: 'status' },
{ path: 'country', model: 'country' },
{ path: 'region', model: 'region' },
{ path: 'city', model: 'city' },
{ path: "areas", model: "area", populate: { path: "city", model: "city" } },
{ path: 'provider', model: 'user' },
{ path: 'vehicles.vehicle', model: 'vehicle' },
{ path: 'role', model: 'userRole' }
];
export default {

        validateAddUserBody() {
            let validations = [
                // body('status').optional().not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                //     .custom(async (val) => {
                //         await checkExist(val, Status, { deleted: false });
                //         return true;
                //     }),
                body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') }),
                body('name').not().isEmpty().withMessage(() => i18n.__('filedRequired')),

                body('email').optional().trim().not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                    .isEmail().withMessage(() => i18n.__('invalid'))
                    .custom(async (value, { req }) => {
                        value = (value.trim()).toLowerCase();
                        let userQuery = { email: value, deleted: false, type: 'DRIVER' };
                        if (await User.findOne(userQuery))
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('password').not().isEmpty().withMessage(() => i18n.__('filedRequired')),

                body('phone').not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                    .custom(async (value) => {
                        value = (value.trim()).toLowerCase();
                        let userQuery = { phone: value, deleted: false, type: 'DRIVER' };
                        if (await User.findOne(userQuery))
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('contactPersonLandline').optional(),

                body('driverId').not().isEmpty().withMessage(() => i18n.__('filedRequired')),

                body('licenceNumber').optional().not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                    .custom(async (value) => {
                        let userQuery = { licenceNumber: value.trim(), deleted: false };
                        if (await User.findOne(userQuery))
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('startAt').not().isEmpty().withMessage(() => i18n.__('filedRequired')),

                body('bankName').optional(),
                body('iban').optional(),

                body('licenceImage').optional().not().isEmpty().withMessage(() => i18n.__('filedRequired')),
                body('idImage').optional().not().isEmpty().withMessage(() => i18n.__('filedRequired')),

                body('notes').optional(),

                // ---------------- Location validations (country, region[], city[], areas[])
                body('country').not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                    .custom(async (val) => {
                        await checkExist(val, Country, { deleted: false });
                        return true;
                    }),

            body('region')
                .isArray({ min: 1 }).withMessage(() => i18n.__('invalidType'))
                .custom(async (regions, { req }) => {
                    if (!regions || !regions.length) return true; // skip if undefined or empty
                    for (let rId of regions) {
                        await checkExist(rId, Region, { deleted: false });
                        return true;
                    }
                    return true;
                }),

            body('city')
                .isArray({ min: 1 }).withMessage(() => i18n.__('invalidType'))
                .custom(async (cities, { req }) => {
                    if (!cities || !cities.length) return true;
                    for (let cId of cities) {
                        await checkExist(cId, City, { deleted: false });
                        return true;
                    }
                    return true;
                }),

                body('areas')
                    .optional()
                    .isArray().withMessage(() => i18n.__('invalidType'))
                    .custom(async (areas, { req }) => {
                        if (!areas || !areas.length) return true;
                        for (let aId of areas) {
                            await checkExist(aId, Area, { deleted: false });
                            return true;
                        }
                        return true;
                    }),
            ];
            return validations;
        },

        validateAdminChangeUser() {
            let validations = [
                body('userId').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('name').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('email').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .isEmail().withMessage(() => { return i18n.__('invalid') })
                    .custom(async (value, { req }) => {
                        value = (value.trim()).toLowerCase();
                        let userQuery = { email: value, deleted: false, _id: { $ne: req.body.userId }, type: 'DRIVER' };
                        if (await User.findOne(userQuery))
                            throw new Error(i18n.__('duplicated'));
                        else
                            return true;
                    }),
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

                body('contactPersonLandline').optional(),

                body('driverId').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('licenceNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (value, { req }) => {
                    value = value.trim();
                    let userQuery = { licenceNumber: value, deleted: false, _id: { $ne: req.body.userId } };

                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('duplicated'));
                    else
                        return true;
                }),
                body('startAt').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('bankName').optional(),
                body('iban').optional(),

                body('licenceImage').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('idImage').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),

                body('notes').optional(),
                body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') }),
                body('country').optional().not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                    .custom(async (val) => {
                        await checkExist(val, Country, { deleted: false });
                        return true;
                    }),
                body('region').optional()
                .isArray({ min: 1 }).withMessage(() => i18n.__('invalidType'))
                .custom(async (regions, { req }) => {
                    if (!regions || !regions.length) return true; // skip if undefined or empty
                    for (let rId of regions) {
                        await checkExist(rId, Region, { deleted: false });
                        return true;
                    }
                    return true;
                }),

            body('city').optional()
                .isArray({ min: 1 }).withMessage(() => i18n.__('invalidType'))
                .custom(async (cities, { req }) => {
                    if (!cities || !cities.length) return true;
                    for (let cId of cities) {
                        await checkExist(cId, City, { deleted: false });
                        return true;
                    }
                    return true;
                }),

                body('areas')
                    .optional()
                    .isArray().withMessage(() => i18n.__('invalidType'))
                    .custom(async (areas, { req }) => {
                        if (!areas || !areas.length) return true;
                        for (let aId of areas) {
                            await checkExist(aId, Area, { deleted: false });
                            return true;
                        }
                        return true;
                    }),

            ];

            return validations;
        },

        async addUser(req, res, next) {
            try {
                let user = req.user;
                const validatedBody = checkValidations(req);

                validatedBody.type = 'DRIVER';
                validatedBody.role = config.roles[validatedBody.type];

                if (user.type === 'PROVIDER') {
                    validatedBody.provider = user.id;
                }

                if (validatedBody.email) {
                    validatedBody.email = validatedBody.email.trim().toLowerCase();
                }

                // Normalize arrays
                validatedBody.region = Array.isArray(validatedBody.region) ? validatedBody.region : (validatedBody.region ? [validatedBody.region] : []);
                validatedBody.city   = Array.isArray(validatedBody.city)   ? validatedBody.city   : (validatedBody.city ? [validatedBody.city] : []);
                validatedBody.areas  = Array.isArray(validatedBody.areas)  ? validatedBody.areas  : (validatedBody.areas ? [validatedBody.areas] : []);

                // ------------------------------------------------------------
                // 1. Find any ACTIVE driver in the same areas
                // ------------------------------------------------------------
                let activeDriverInAreas = await User.find({
                    type: "DRIVER",
                    deleted: false,
                    status: 1,
                    areas: { $in: validatedBody.areas }
                }).lean();

                let conflictMessage = null;

                if (activeDriverInAreas.length > 0) {
                    conflictMessage = "Driver is currently inactive, you have to deactivate the previous driver to make this driver active.";
                }

                // ------------------------------------------------------------
                // 2. Create new driver
                // ------------------------------------------------------------
                let createdUser = await User.create(validatedBody);
                createdUser = await User.schema.methods.toJSONLocalizedOnly(createdUser, i18n.getLocale());

                // ------------------------------------------------------------
                // 3. Send confirmation email
                // ------------------------------------------------------------
                sendHtmlEmail(
                    createdUser.email,
                    "provider-confirmation.html",
                    {
                        madlolSuplier: config.webUrl,
                        initialPassword: "",
                        email: createdUser.email,
                        fName: createdUser.name,
                        lName: ""
                    },
                    "en"
                );

                // ------------------------------------------------------------
                // 4. Response (IMPORTANT FIX)
                // ------------------------------------------------------------
                res.status(200).send({
                    message: conflictMessage,     // null OR string
                    user: createdUser,            // ALWAYS return NEW DRIVER
                    oldDrivers: activeDriverInAreas // Return old driver(s) separately
                });

            } catch (error) {
                next(error);
            }
        },

        async userInformation(req, res, next) {
            try {
                let userId = req.query.userId;
                let { removeLanguage } = req.query;
                // if (!userId) userId = req.user.id;
                let user = await checkExistThenGet(userId, User, {type: "DRIVER", deleted: false, populate: populateQuery });
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
                let validatedBody = checkValidations(req);
                let { removeLanguage } = req.query;
                if (validatedBody.email)
                    validatedBody.email = (validatedBody.email.trim()).toLowerCase();

                // If password is empty string or only whitespace, remove it so it won't overwrite existing password
                if ('password' in validatedBody) {
                    if (!validatedBody.password || String(validatedBody.password).trim() === '') {
                        delete validatedBody.password;
                    } else {
                        const salt = bcrypt.genSaltSync();
                        validatedBody.password = await bcrypt.hash(validatedBody.password, salt);
                    }
                }

                // If images are present but empty, remove them to avoid overwriting existing images
                if ('licenceImage' in validatedBody) {
                    if (!validatedBody.licenceImage) delete validatedBody.licenceImage;
                }
                if ('idImage' in validatedBody) {
                    if (!validatedBody.idImage) delete validatedBody.idImage;
                }

                // ✅ Allow updating location fields too - validate arrays and normalize
                if (validatedBody.country)
                    await checkExist(validatedBody.country, Country, { deleted: false });

                if (validatedBody.region) {
                    const regions = Array.isArray(validatedBody.region) ? validatedBody.region : [validatedBody.region];
                    for (let r of regions) {
                        await checkExist(r, Region, { deleted: false });
                    }
                    validatedBody.region = regions;
                }

                if (validatedBody.city) {
                    const cities = Array.isArray(validatedBody.city) ? validatedBody.city : [validatedBody.city];
                    for (let c of cities) {
                        await checkExist(c, City, { deleted: false });
                    }
                    validatedBody.city = cities;
                }

                if (validatedBody.areas) {
                    const areas = Array.isArray(validatedBody.areas) ? validatedBody.areas : [validatedBody.areas];
                    for (let a of areas) {
                        await checkExist(a, Area, { deleted: false });
                    }
                    validatedBody.areas = areas;
                }

                let user = await checkExistThenGet(validatedBody.userId, User, { deleted: false });

                
                user = await User.findOneAndUpdate(
                    { deleted: false, _id: validatedBody.userId },
                    { ...validatedBody },
                    { new: true }
                );
                
                if (!removeLanguage) {
                   user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());
               }
                // user = await User.schema.methods.toJSONLocalizedOnly(user, i18n.getLocale());
                res.status(200).send(user);

            } catch (error) {
                next(error);
            }
        },

        async deleteUserAccount(req, res, next) {
            try {
                let userId = req.params.driverId;
                let user = await checkExistThenGet(userId, User, { deleted: false ,type:'DRIVER',populate:populateQuery});
                let isVehicleDeleted = false;
                let length = user.vehicles.length ;
                for (let index = 0; index < length; index++) {
                    let vehicle =  user.vehicles[index].vehicle;
                    await vehicleModel.findByIdAndUpdate(vehicle.id,{$pull:{drivers:userId}},{new :true});
                }

                await ConfirmationCode.deleteMany({ email: user.email });
                user.deleted = true;
                await user.save();
                res.status(200).send({isVehicleDeleted});
            } catch (error) {
                next(error);
            }
        },

        validateAssignVehicle() {
          return [
            body('vehicle')
                .isArray({ min: 1 })
                .withMessage(() => i18n.__('invalidVehicleList')),

            body('vehicle.*.vehicle')
                .exists().withMessage(() => i18n.__('filedRequired'))
                .notEmpty().withMessage(() => i18n.__('filedRequired')),
        ];
        },
        
       validateUnassignVehicle() {
            return [
                body('vehicle')
                    .exists().withMessage(() => i18n.__('vehicleRequired'))
                    .notEmpty().withMessage(() => i18n.__('vehicleRequired'))
                    .isInt({ min: 1 }).withMessage(() => i18n.__('invalidVehicle')),
            ];
        },



        // async assignVehicle(req, res, next){
        //     try {
        //         let user = req.user;
        //         let {driverId} = req.params;
        //         let driver = await checkExistThenGet(driverId,User,{deleted:false});
        //         let validatedBody = checkValidations(req);

        //         if (!Array.isArray(validatedBody.vehicle)) {
        //             return next(new ApiError(400,i18n.__('invalidVehicleList')));
        //         }

        //         let vehicles = validatedBody.vehicle.map(i => i.vehicle);

        //         let length = driver.vehicles.length;
        //         for (let index = 0; index < length; index++) {
        //             if (vehicles.includes(driver.vehicles[index].vehicle)) {
        //                 return next(new ApiError(400,i18n.__('alreadyExist')));
        //             }
        //         }

        //         let vehiclesData = await vehicleModel.find({deleted:false,status:config.status.active,_id:{$in:vehicles}});
        //         if (vehiclesData.length != vehicles.length) {
        //             return next(new ApiError(400,i18n.__('invalid')));
        //         }

        //         driver.vehicles.push(...validatedBody.vehicle);
        //         await driver.save();
        //         await vehicleModel.updateMany({_id:{$in:vehicles}},{$addToSet:{drivers:driverId}});
        //         res.status(200).send(driver);
        //     } catch (error) {
        //         next(error);
        //     }
        // },

        // async unassignVehicle(req,res,next){
        //     try {
        //         let user = req.user;
        //         let {driverId} = req.params;
        //         let driver = await checkExistThenGet(driverId,User,{deleted:false});
        //         let validatedBody = checkValidations(req);
        //         let vehicle = await checkExistThenGet(validatedBody.vehicle,vehicleModel,{deleted:false});

        //         await User.findOneAndUpdate({_id:driverId},{$pull:{vehicles:{vehicle:vehicle.id}}},{new :true});
        //         await vehicleModel.findByIdAndUpdate(validatedBody.vehicle,{$pull:{drivers:driverId}},{new :true});
        //         res.status(200).send(driver);

        //     } catch (error) {
        //         next(error);
        //     }
        // }

      async assignVehicle(req, res, next) {
            try {
                let user = req.user;
                let { driverId } = req.params;

                let driver = await checkExistThenGet(driverId, User, { deleted: false });
                let validatedBody = checkValidations(req);

                // Expect exactly ONE vehicle
                if (
                    !Array.isArray(validatedBody.vehicle) ||
                    validatedBody.vehicle.length !== 1
                ) {
                    return next(new ApiError(400, i18n.__('onlyOneVehicleAllowed')));
                }

                const newVehicleId = validatedBody.vehicle[0].vehicle;

                // Validate new vehicle exists and active
                const newVehicle = await checkExistThenGet(
                    newVehicleId,
                    vehicleModel,
                    { deleted: false, status: config.status.active }
                );

                // STEP 1: Remove old vehicle assignment (if exists)
                const oldVehicleIds = driver.vehicles.map(v => v.vehicle);

                if (oldVehicleIds.length > 0) {
                    // Remove driver reference from old vehicles
                    await vehicleModel.updateMany(
                        { _id: { $in: oldVehicleIds } },
                        { $pull: { drivers: driverId } }
                    );
                }

                // STEP 2: Clear driver's vehicles array
                driver.vehicles = [];

                // STEP 3: Assign new vehicle
                driver.vehicles = [{ vehicle: newVehicleId }];
                await driver.save();

                // STEP 4: Link driver to new vehicle
                await vehicleModel.findByIdAndUpdate(
                    newVehicleId,
                    { $addToSet: { drivers: driverId } }
                );

                const updatedDriver = await User.findById(driverId)
                    .populate([
                        { path: "vehicles.vehicle", model: "vehicle" },
                    ]);

                res.status(200).send(updatedDriver);

            } catch (error) {
                next(error);
            }
        },



          async unassignVehicle(req, res, next) {
            try {
                let user = req.user;
                let { driverId } = req.params;

                let driver = await checkExistThenGet(driverId, User, { deleted: false });
                let validatedBody = checkValidations(req);

                const vehicleId = validatedBody.vehicle;

                let vehicle = await checkExistThenGet(
                    vehicleId,
                    vehicleModel,
                    { deleted: false }
                );

                // Remove from driver
                await User.findByIdAndUpdate(
                    driverId,
                    { $pull: { vehicles: { vehicle: vehicle.id } } },
                    { new: true }
                );

                // Remove driver reference from vehicle
                await vehicleModel.findByIdAndUpdate(
                    vehicleId,
                    { $pull: { drivers: driverId } },
                    { new: true }
                );

                const updatedDriver = await User.findById(driverId)
                    .populate([{ path: "vehicles.vehicle", model: "vehicle" }]);

                res.status(200).send(updatedDriver);
            } catch (error) {
                next(error);
            }
        }


};