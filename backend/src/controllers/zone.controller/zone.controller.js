import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import {  checkExistThenGet } from "../../helpers/CheckMethods.js";
import {  checkValidations } from "../shared.controller/shared.controller.js";
import { body } from "express-validator";
import Zone from "../../models/zone.model/zone.model.js";
import i18n from 'i18n'
import dotObject from 'dot-object';
import moment from 'moment';

import socketEvents from "../../socketEvents.js";
import userModel from '../../models/user.model/user.model.js';

const updateDriverZone =  (zone)=>{
    notificationNSP.to('room-' + zone.driver).emit(socketEvents.UpdateDriverZone, { zone });
}

export default {

    async findAll(req, res, next) {
        try {
            // let tt = await Zone.find({deleted:false,trader:{$ne:null}}).distinct('trader');
            // let traders = await userModel.find({type:'INSTITUTION',status:'ACCEPTED', deleted:false,_id:{$nin:tt}});
            // let len = traders.length;
            // for (let index = 0; index < len; index++) {
            //     await Zone.create({
            //         trader:traders[index].id,
            //         isTraderDefault:true,
            //         radius:900000,
            //         location:{type:'Point',coordinates:[31.219709,30.0609422]},
            //         currentDriverLocation : {
            //             type: 'Point',
            //             coordinates: [31.219709,30.0609422]
            //         }
            //     });
            // }
            
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { name, month, year, all, long, lat, trader,driver ,appZones} = req.query
            let query = { deleted: false , isTraderDefault:null };
            if (trader) query.trader = trader;
            if (driver) query.driver = driver;
            if (name) {
                query.$or = [{ 'name.en': { '$regex': name, '$options': 'i' } }, { 'name.ar': { '$regex': name, '$options': 'i' } }]
            }
            if (appZones) {
                query.trader = null;
                query.driver = null;
            }
            let date = new Date();

            if (month && year) {
                month = month - 1;
                date.setMonth(month);
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('month');
                let endOfDate = moment(date).endOf('month');

                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            if (year && !month) {
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('year');
                let endOfDate = moment(date).endOf('year');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }

            const zonesCount = await Zone.count(query);
            let zones;
            let pageCount = zonesCount;
            if (all) {
                limit = pageCount;
                zones = await Zone.find(query).sort({ createdAt: -1 })
            } else if (long && lat) {
                zones = await Zone.aggregate([
                    // Find points or objects "near" and project the distance
                    {
                        $geoNear: {
                            near: {
                                type: "Point",
                                coordinates: [+long, +lat]
                            },
                            distanceField: "distance",
                        }
                    },
                    {
                        $match: {deleted: false,trader:{$ne: null}}
                    },
                    // Logically filter anything outside of the radius
                    {
                        $redact: {
                            $cond: {
                                if: { $gt: ["$distance", "$radius"] },
                                then: "$$PRUNE",
                                else: "$$KEEP"
                            }
                        }
                    },

                ]);
            }
            else {
                pageCount = Math.ceil(zonesCount / limit);
                zones = await Zone.find(query).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit)
            }
            // zones = Zone.schema.methods.toJSONLocalizedOnly(zones, i18n.getLocale());
            res.send(new ApiResponse(zones, page, pageCount, limit, zonesCount, req));
        } catch (err) {
            next(err);
        }
    },

    validateBody(isUpdate = false) {
        let validations = [];
        if (!isUpdate) {
            validations = [
                body('name.en').not().isEmpty().withMessage(() => { return i18n.__('englishName') }),
                body('name.ar').not().isEmpty().withMessage(() => { return i18n.__('arabicName') }),
                body('radius').not().isEmpty().withMessage(() => { return i18n.__('radiusRequired') }),
                body('location').not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('location.lat').optional().not().isEmpty().withMessage(() => { return i18n.__('longitudeRequired') }),
                body('location.long').optional().not().isEmpty().withMessage(() => { return i18n.__('latitudeRequired') }),
                body('driver').optional().not().isEmpty().withMessage(() => { return i18n.__('driverRequired') }),
                body('trader').optional().not().isEmpty().withMessage(() => { return i18n.__('traderRequired') }),

            ];
        }
        else {
            validations = [

                body('name.en').optional().not().isEmpty().withMessage(() => { return i18n.__('englishName') }),
                body('name.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('arabicName') }),
                body('radius').optional().not().isEmpty().withMessage(() => { return i18n.__('radiusRequired') }),
                body('location').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('location.lat').optional().not().isEmpty().withMessage(() => { return i18n.__('longitudeRequired') }),
                body('location.long').optional().not().isEmpty().withMessage(() => { return i18n.__('latitudeRequired') }),
                body('driver').optional().not().isEmpty().withMessage(() => { return i18n.__('driverRequired') }),
                body('trader').optional().not().isEmpty().withMessage(() => { return i18n.__('traderRequired') }),

            ];
        }
        return validations;
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            let validatedBody = checkValidations(req);
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                validatedBody.trader = user.id;
            }

            // if (user.type == 'INSTITUTION') {
                
            // }else if (user.type == 'DRIVER') {
            //     validatedBody.driver = user.id;
            // }
            
            validatedBody.currentDriverLocation = {
                type: 'Point',
                coordinates: [+validatedBody.location.long, +validatedBody.location.lat]
            }
            validatedBody.location = {
                type: 'Point',
                coordinates: [+validatedBody.location.long, +validatedBody.location.lat]
            }
            if (validatedBody.trader) {
                await Zone.findOneAndUpdate({deleted:false,trader:validatedBody.trader , isTraderDefault:true},{$set:{deleted:true}});
            }
            let createdZone = await Zone.create(validatedBody);
            createdZone = Zone.schema.methods.toJSONLocalizedOnly(createdZone, i18n.getLocale());
            res.status(200).send(createdZone);

        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { zoneId } = req.params;
            let { removeLanguage } = req.query;
            let zone = await checkExistThenGet(zoneId, Zone, { deleted: false });
            if (!removeLanguage) {
                zone = Zone.schema.methods.toJSONLocalizedOnly(zone, i18n.getLocale());
            }
            res.status(200).send(zone);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let user = req.user;
            // if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN')
            //     return next(new ApiError(403, ('admin.auth')));

            let { zoneId } = req.params;
            let { removeLanguage } = req.query;
            let zone = await checkExistThenGet(zoneId, Zone, { deleted: false });
            let validatedBody = checkValidations(req);
            let data = {};
            if (validatedBody.location) {
                data.location = {
                    type: 'Point',
                    coordinates: [+validatedBody.location.long, +validatedBody.location.lat]
                }
                delete validatedBody.location;
            }
            validatedBody = dotObject.dot(validatedBody);
            let updatedZone = await Zone.findByIdAndUpdate(zoneId,  { ...validatedBody, ...data }, { new: true })
            if (!removeLanguage) {
                updatedZone = Zone.schema.methods.toJSONLocalizedOnly(updatedZone, i18n.getLocale());
            }
            res.status(200).send(updatedZone);

            if (updatedZone.driver) {
                updateDriverZone(updatedZone);
            }
        }
        catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user;

            let { zoneId } = req.params;
            let zone = await checkExistThenGet(zoneId, Zone, { deleted: false });
            zone.deleted = true;
            await zone.save();

            if (zone.trader) {
                let currentZone = await Zone.findOne({deleted:false,trader:zone.trader});
                if (!currentZone) {
                    await Zone.create({
                        trader:zone.trader,
                        isTraderDefault:true,
                        radius:900000,
                        location:{type:'Point',coordinates:[31.219709,30.0609422]}
                    });
                }
            }

            res.status(200).send('Deleted Successfully');
        }
        catch (err) {
            next(err);
        }
    },

    async checkLatLongZone(req, res, next){
        try {
            let {lat,long} = req.query;

            if (!(lat&&long)) {
                return next(new ApiError(404,i18n.__('locationRequired')));
            }

            let zones = await Zone.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [+long, +lat]
                        },
                        distanceField: "distance",
                        key:'location'
                    }
                },
                {
                    $match: {deleted: false, $and:[{driver:{$eq: null}},{trader:{$eq: null}}] }
                },
                {
                    $redact: {
                        $cond: {
                            if: { $gt: ["$distance", "$radius"] },
                            then: "$$PRUNE",
                            else: "$$KEEP"
                        }
                    }
                },
                {
                    $limit:1
                }
            ]);
            if (zones.length > 0) {
                res.status(200).send({inZone:true});
            }else{
                res.status(200).send({inZone:false});
            }
        } catch (error) {
            next(error);
        }
    },

    validateDeleteMulti() {
        return [
            body('ids').not().isEmpty().withMessage(() => { return i18n.__('idsRequired') }).isArray().withMessage('must be array'),
        ];
    },

    async deleteMulti(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN')
                return next(new ApiError(403, i18n.__('unauthrized')));

            let validatedBody = checkValidations(req);
            await Zone.updateMany({ _id: { $in: validatedBody.ids }, deleted: false }, { deleted: true, deletedDate: new Date() })
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    }
};