import Vehicle from "../../models/vehicle.model/vehicle.model.js";
import Driver from "../../models/user.model/user.model.js";
import Trademark from "../../models/trademark.model/trademark.model.js";
import Status from "../../models/status.model/status.model.js";

import vehicleHistory from "../../controllers/vehicle-history.controller/vehicle-history.controller.js";

import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import config from "../../config.js";


let populateQuery = [
    // { path: 'status', model: 'status' },
    { path: 'drivers', model: 'user' },
    { path: 'provider', model: 'user' },
    // { path: 'trademark', model: 'trademark' }
];


export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [

                body('name').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('vehicleNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (val, { req }) => {

                    let query = { vehicleNumber: val, deleted: false };
                    let vehicle = await Vehicle.findOne(query).lean();
                    if (vehicle)
                        throw new Error(i18n.__('duplicated'));
                    return true;
                }),
                body('trademark').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                // .custom(async(val)=>{
                //     await checkExist(val,Trademark,{deleted:false});
                //     return true;
                // })
                ,
                body('chassisNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (val, { req }) => {

                    let query = { chassisNumber: val, deleted: false };
                    let vehicle = await Vehicle.findOne(query).lean();
                    if (vehicle)
                        throw new Error(i18n.__('duplicated'));
                    return true;
                }),
                body('engineNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (val, { req }) => {

                    let query = { engineNumber: val, deleted: false };
                    let vehicle = await Vehicle.findOne(query).lean();
                    if (vehicle)
                        throw new Error(i18n.__('duplicated'));
                    return true;
                }),
                body('model').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                // body('docs').optional({ nullable: true, checkFalsy: true }).not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                // .isArray().withMessage(() => { return i18n.__('invalidValue') }),
                body('docs')
                    .optional({ nullable: true, checkFalsy: true })
                    .custom((val) => {
                        if (val == null) return true;
                        if (!Array.isArray(val)) throw new Error(i18n.__('invalidValue'));
                        const validItems = val.filter(Boolean);
                        if (validItems.length === 0) return true; // empty array allowed
                        return true;
                    }),
                body('notes').trim().optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                
                // body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                //     .custom(async (val) => {
                //         await checkExist(val, Status, { deleted: false });
                //         return true;
                //     })
                     body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') })
            ];
        }
        else {
            validations = [
                body('targetDriver').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (val) => {
                    await checkExist(val, Driver, { deleted: false });
                    return true;
                }),
                body('name').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('vehicleNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (val, { req }) => {

                    let query = { vehicleNumber: val, deleted: false, _id: { $ne: req.params.vehicleId } };
                    let vehicle = await Vehicle.findOne(query).lean();
                    if (vehicle)
                        throw new Error(i18n.__('duplicated'));
                    return true;
                }),
                body('trademark').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                // .custom(async(val)=>{
                //     await checkExist(val,Trademark,{deleted:false});
                //     return true;
                // })
                ,
                body('chassisNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (val, { req }) => {

                    let query = { vehicleNumber: val, deleted: false, _id: { $ne: req.params.vehicleId } };
                    let vehicle = await Vehicle.findOne(query).lean();
                    if (vehicle)
                        throw new Error(i18n.__('duplicated'));
                    return true;
                }),
                body('engineNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (val, { req }) => {

                    let query = { engineNumber: val, deleted: false, _id: { $ne: req.params.vehicleId } };
                    let vehicle = await Vehicle.findOne(query).lean();
                    if (vehicle)
                        throw new Error(i18n.__('duplicated'));
                    return true;
                }),
                body('model').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                // body('docs').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                // .isArray().withMessage(() => { return i18n.__('invalidValue') }),
                // body('docs')
                //     .optional({ nullable: true, checkFalsy: true })
                //     .custom((val) => {
                //         if (val == null) return true;
                //         if (!Array.isArray(val)) throw new Error(i18n.__('invalidValue'));
                //         const validItems = val.filter(Boolean);
                //         if (validItems.length === 0) return true; // empty array allowed
                //         return true;
                //     }),
                body('notes').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                

        // body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                //     .custom(async (val) => {
                //         await checkExist(val, Status, { deleted: false });
                //         return true;
                //     })

                body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') })
            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {driver,  removeLanguage ,all,trademark,name,provider,hasNoProvider,hasProvider} = req.query;
            let query = { deleted: false };
            let sortQuery = { createdAt: -1 }
            checkDateFilter(req,query,sortQuery,true);

            
            if (driver) query.drivers = driver;
            if (hasNoProvider) query.provider = null;
            if (hasProvider) query.provider = {$ne:null};
            if (provider) {
                query.provider = provider;
            }
            if (trademark) {
                query.trademark = trademark;
            }
            if (name) {
                // query.name = { '$regex': name, '$options': 'i' };
                query.$or = [
                    {name : { '$regex': name, '$options': 'i' }},
                    {vehicleNumber : { '$regex': name, '$options': 'i' }}
                ]
            }

            let vehicles;

            let count = await Vehicle.countDocuments(query);
            let pageCount = count;
            if (all) {
                pageCount=1;
                limit = count;
                vehicles = await Vehicle.find(query).sort(sortQuery).populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                vehicles = await Vehicle.find(query).sort(sortQuery).limit(limit).skip((page - 1) * limit).populate(populateQuery)
            }
            
            if (!removeLanguage) {
                vehicles = Vehicle.schema.methods.toJSONLocalizedOnly(vehicles, i18n.getLocale());
            }
            res.send(new ApiResponse(vehicles, page, pageCount, limit, count, req));


        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            let validatedBody = checkValidations(req);
            if (user.type == 'PROVIDER') {
                validatedBody.provider = user.id;  
            }
            
            let vehicle = await Vehicle.create(validatedBody);
            vehicle = Vehicle.schema.methods.toJSONLocalizedOnly(vehicle, i18n.getLocale());
            res.status(200).send(vehicle);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { vehicleId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;
            // if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
            //     return next(new ApiError(403, i18n.__('admin.auth')));
            // }
            await checkExist(vehicleId, Vehicle, { deleted: false });
            let validatedBody = checkValidations(req);
            
            let updatedVehicle = await Vehicle.findByIdAndUpdate(vehicleId, validatedBody, { new: true });
            if (!removeLanguage)
                updatedVehicle = Vehicle.schema.methods.toJSONLocalizedOnly(updatedVehicle, i18n.getLocale());
            res.status(200).send(updatedVehicle);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { vehicleId } = req.params;
            let { removeLanguage } = req.query;
            let vehicle = await checkExistThenGet(vehicleId, Vehicle, { deleted: false ,populate:populateQuery});
            if (!removeLanguage) {
                vehicle = Vehicle.schema.methods.toJSONLocalizedOnly(vehicle, i18n.getLocale());
            }
            res.status(200).send(vehicle);

        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user;
            // if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
            //     return next(new ApiError(403, i18n.__('admin.auth')));
            // }
            let { vehicleId } = req.params;
            let vehicle = await checkExistThenGet(vehicleId, Vehicle, { deleted: false,populate:populateQuery });

            let length = vehicle.drivers.length;
            let isDriverDeleted = false;
            for (let index = 0; index < length; index++) {
                let driver = vehicle.drivers[index]
                // if (driver.vehicles.length == 1) {
                //     driver.deleted = true;
                //     await driver.save();
                //     isDriverDeleted = true;
                // }else{
                //     await Driver.findByIdAndUpdate(driver.id,{ $pull: { vehicles: { vehicle: vehicle.id } } },{new:true});
                // }
                await Driver.findByIdAndUpdate(driver.id,{ $pull: { vehicles: { vehicle: vehicle.id } } },{new:true});
            }
            
            if (false) {
                vehicle.softDeleted =  true;
            } else {
                vehicle.deleted = true;
            }
            await vehicle.save();
            res.status(200).send({isDriverDeleted});
            
        }
        catch (err) {
            next(err);
        }
    },

    async unlinkDriver(req,res,next){
        try {
            let { vehicleId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;
            
            let vehicle =  await checkExistThenGet(vehicleId, Vehicle, { deleted: false });
            let validatedBody = checkValidations(req);
            if (!validatedBody.targetDriver) {
                return next(new ApiError(400,i18n.__('driverFiledRequired')));
            }
            if (! vehicle.drivers.includes(validatedBody.targetDriver)) {
                return next(new ApiError(400,i18n.__('driverFiledRequired')));
            }
            let driver = await checkExistThenGet(validatedBody.targetDriver,Driver,{deleted:false});
            
            let length = driver.vehicles.length;
            let joinDate = new Date();
            for (let index = 0; index < length; index++) {
                if (driver.vehicles[index].vehicle == vehicleId ) {
                    joinDate = driver.vehicles[index].joinDate;
                }
            }
            let updatedVehicle = await Vehicle.findByIdAndUpdate(vehicleId, {$pull:{drivers:validatedBody.targetDriver}}, { new: true });
            driver = await Driver.findByIdAndUpdate(driver.id,{ $pull: { vehicles: { vehicle: vehicle.id } } },{new:true});

            await vehicleHistory.create({vehicle:vehicleId,driver:validatedBody.targetDriver,startAt:joinDate,endAt:new Date()});
            if (!removeLanguage)
                updatedVehicle = Vehicle.schema.methods.toJSONLocalizedOnly(updatedVehicle, i18n.getLocale());
            res.status(200).send(updatedVehicle);
        } catch (error) {
            next(error)
        }
    },

    async linkDriver(req,res,next){
        try {
            let { vehicleId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;
            
            let vehicle =  await checkExistThenGet(vehicleId, Vehicle, { deleted: false });
            let validatedBody = checkValidations(req);
            if (!validatedBody.targetDriver) {
                return next(new ApiError(400,i18n.__('driverFiledRequired')));
            }
            if ( vehicle.drivers.includes(validatedBody.targetDriver)) {
                return next(new ApiError(400,i18n.__('alreadyExist')));
            }

            let updatedVehicle = await Vehicle.findByIdAndUpdate(vehicleId, {$addToSet:{drivers:validatedBody.targetDriver}}, { new: true });
            await Driver.findByIdAndUpdate(validatedBody.targetDriver,{ $push: { vehicles: { vehicle: vehicle.id } } },{new:true});

            if (!removeLanguage)
                updatedVehicle = Vehicle.schema.methods.toJSONLocalizedOnly(updatedVehicle, i18n.getLocale());
            res.status(200).send(updatedVehicle);
        } catch (error) {
            next(error)
        }
    }
}