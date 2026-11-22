import Region from "../../models/region.model/region.model.js";
import City from "../../models/city.model/city.model.js";
import Status from "../../models/status.model/status.model.js";
import Country from "../../models/country.model/country.model.js";

import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import dotObject from 'dot-object';
let populateQuery = [
  { path: 'status', model: 'status' },
  { path: 'country', model: 'country' } // ✅ matches your schema
]



export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
                body('postalCode').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('latitude').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('longitude').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                
                body('name.ar').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false, country: req.body.country };
                        let region = await Region.findOne(query).lean();
                        if (region)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false, country: req.body.country };
                        let region = await Region.findOne(query).lean();
                        if (region)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false, country: req.body.country };
                        let region = await Region.findOne(query).lean();
                        if (region)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('country').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                  console.log(val,"val");
                    await checkExist(val, Country, { deleted: false });
                    return true;
                }),
                body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Status, { deleted: false });
                        return true;
                    }) 
            ];
        }
        else {
            validations = [

                body('postalCode').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('latitude').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('longitude').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                
                body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.ar': val, deleted: false, _id: { $ne: req.params.regionId } };
                        let region = await Region.findOne(query).lean();
                        if (region)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.en': val, deleted: false, _id: { $ne: req.params.regionId } };
                        let region = await Region.findOne(query).lean();
                        if (region)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.es': val, deleted: false, _id: { $ne: req.params.regionId } };
                        let region = await Region.findOne(query).lean();
                        if (region)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('country').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Country, { deleted: false });
                    return true;
                }),
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

    // async findAll(req, res, next) {
    //     try {

    //         let page = +req.query.page || 1, limit = +req.query.limit || 20;
    //         let {  city, country ,removeLanguage,all} = req.query;
    //         let query = { deleted: false };
    //         let sortQuery = { _id: -1 }

    //         checkDateFilter(req,query,sortQuery)

    //         if (city) query.city = city;
    //         if (country) {
    //             let cities = await City.find({ deleted: false, country: country }).distinct('_id');
    //             query.city = { $in: cities }
    //         }


    //         let count = await Region.countDocuments(query);
    //         let pageCount = count;
    //         let regions;
    //         if (all) {
    //             pageCount = 1;
    //             limit = count;
    //             regions = await Region.find(query)
    //                 .sort({ createdAt: -1 }).populate(populateQuery).sort(sortQuery);
    //         }
    //         else {
    //             pageCount = Math.ceil(count / limit);

    //             regions = await Region.find(query)
    //                 .sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit)
    //                 .populate(populateQuery).sort(sortQuery);
    //         }

    //         if (!removeLanguage) {
    //             regions = Region.schema.methods.toJSONLocalizedOnly(regions, i18n.getLocale());
    //         }

    //         res.send(new ApiResponse(regions, page, pageCount, limit, count, req));



    //     } catch (err) {
    //         next(err);
    //     }
    // },

    async findAll(req, res, next) {
    try {
        let page = +req.query.page || 1, limit = +req.query.limit || 20;
        let { country, removeLanguage, all } = req.query;

        let query = {};
        let sortQuery = { _id: -1 };

        checkDateFilter(req, query, sortQuery);

        // If country param exists → filter by country directly
        if (country) {
            query.country = Number(country); 
        }
        let count = await Region.countDocuments(query);
        let pageCount = count;
        let regions;

        if (all) {
            pageCount = 1;
            limit = count;
            regions = await Region.find(query)
                .sort({ createdAt: -1 })
                .populate(populateQuery)
                .sort(sortQuery);
        } else {
            pageCount = Math.ceil(count / limit);
            regions = await Region.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .populate(populateQuery)
                .sort(sortQuery);
        }

        if (!removeLanguage) {
            regions = Region.schema.methods.toJSONLocalizedOnly(regions, i18n.getLocale());
        }

        res.send(new ApiResponse(regions, page, pageCount, limit, count, req));
    } catch (err) {
        next(err);
    }
},


    async create(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            let validatedBody = checkValidations(req);
            let region = await Region.create(validatedBody);
            region = await Region.populate(region, populateQuery);
            region = Region.schema.methods.toJSONLocalizedOnly(region, i18n.getLocale());
            res.status(200).send(region);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { regionId } = req.params;
            let { removeLanguage } = req.query;
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            await checkExist(regionId, Region, { deleted: false });
            let validatedBody = checkValidations(req);
            
            validatedBody = dotObject.dot(validatedBody);
            let updatedRegion = await Region.findByIdAndUpdate(regionId, validatedBody , { new: true });
            if (!removeLanguage)
                updatedRegion = Region.schema.methods.toJSONLocalizedOnly(updatedRegion, i18n.getLocale());
            res.status(200).send(updatedRegion);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { regionId } = req.params;
            let { removeLanguage } = req.query;
            let region = await checkExistThenGet(regionId, Region, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                region = Region.schema.methods.toJSONLocalizedOnly(region, i18n.getLocale());
            }
            res.status(200).send(region);

        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            let { regionId } = req.params;
            let region = await checkExistThenGet(regionId, Region, { deleted: false });
            region.deleted = true;
            await region.save();
            res.status(200).send("Deleted Successfully");

        }
        catch (err) {
            next(err);
        }
    }
}