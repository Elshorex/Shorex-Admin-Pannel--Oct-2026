import City from "../../models/city.model/city.model.js";
import Country from "../../models/country.model/country.model.js";
import Region from "../../models/region.model/region.model.js";
import Status from "../../models/status.model/status.model.js";

import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations, handleImg } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import dotObject from 'dot-object';
let populateQuery = [
    { path: 'status', model: 'status' },
    { path: 'country', model: 'country' },
    { path: 'region', model: 'region' },
];

export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
                body('latitude').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('longitude').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('name.ar').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false, country: req.body.country };
                        let city = await City.findOne(query).lean();
                        if (city)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false, country: req.body.country };
                        let city = await City.findOne(query).lean();
                        if (city)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false, country: req.body.country };
                        let city = await City.findOne(query).lean();
                        if (city)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('country').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Country, { deleted: false });
                    return true;
                }),
                  body('region').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Region, {deleted: false });
                    return true;
                }),
                // body('status').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                //     .custom(async (val) => {
                //         await checkExist(val, Status, { deleted: false });
                //         return true;
                //     })
                body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') })
                
            ];
        }
        else {
            validations = [
                body('latitude').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('longitude').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false,  _id: { $ne: req.params.cityId } };
                        let city = await City.findOne(query).lean();
                        if (city)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false,  _id: { $ne: req.params.cityId } };
                        let city = await City.findOne(query).lean();
                        if (city)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false,  _id: { $ne: req.params.cityId } };
                        let city = await City.findOne(query).lean();
                        if (city)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('country').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Country, { deleted: false });
                    return true;
                }),
                body('region').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Region, {});
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

 async findAll(req, res, next) {
    try {
        let page = +req.query.page || 1, limit = +req.query.limit || 20;
        let { name, country, region, month, year, all, removeLanguage } = req.query;
        let query = {};
        let sortQuery = { _id: -1 };

        checkDateFilter(req, query);

        if (country) query.country = country;

        if (region) {
            // Normalize region into array of numbers
            let regions = Array.isArray(region)
                ? region.map(Number)
                : region.split(',').map(r => Number(r.trim()));
            query.region = { $in: regions };
        }

        let count = await City.countDocuments(query);
        let pageCount = count;
        let cities;

        if (all) {
            pageCount = 1;
            limit = count;
            cities = await City.find(query).sort(sortQuery).populate(populateQuery);
        } else {
            pageCount = Math.ceil(count / limit);
            cities = await City.find(query).sort(sortQuery)
                .limit(limit)
                .skip((page - 1) * limit)
                .populate(populateQuery);
        }

        if (!removeLanguage) {
            cities = City.schema.methods.toJSONLocalizedOnly(cities, i18n.getLocale());
        }

        res.send(new ApiResponse(cities, page, pageCount, limit, count, req));

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
            let city = await City.create(validatedBody);
            city = await City.populate(city, populateQuery);
            city = City.schema.methods.toJSONLocalizedOnly(city, i18n.getLocale());
            res.status(200).send(city);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { cityId } = req.params;
            let { removeLanguage } = req.query;            
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            await checkExist(cityId, City, { deleted: false });
            let validatedBody = checkValidations(req);
            validatedBody = dotObject.dot(validatedBody);
            let updatedCity = await City.findByIdAndUpdate(cityId, validatedBody, { new: true });
            if(! removeLanguage) 
                updatedCity = City.schema.methods.toJSONLocalizedOnly(updatedCity, i18n.getLocale());
            res.status(200).send(updatedCity);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { cityId } = req.params;
            let { removeLanguage } = req.query;
            let city = await checkExistThenGet(cityId, City, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                city = City.schema.methods.toJSONLocalizedOnly(city, i18n.getLocale());
            }
            res.status(200).send(city);

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
            let { cityId } = req.params;
            let city = await checkExistThenGet(cityId, City, { deleted: false });
            let region = await Region.findOne({deleted:false,city:cityId});
            if (region) {
                return next(new ApiError(400, i18n.__('relationExist')));
            }
            city.deleted = true;
            await city.save();
            res.status(200).send("Deleted Successfully");
            // await Region.updateMany({deleted: false,city:cityId},{deleted: true})

        }
        catch (err) {
            next(err);
        }
    }
}