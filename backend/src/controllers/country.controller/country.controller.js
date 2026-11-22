import Country from "../../models/country.model/country.model.js";
import Status from "../../models/status.model/status.model.js";
import Language from "../../models/language.model/language.model.js";
import Currency from "../../models/currency.model/currency.model.js";
import City from "../../models/city.model/city.model.js";

import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations, handleImg } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import dotObject from 'dot-object'


let populateQuery = [
    { path: 'status', model: 'status' },
    { path: 'currency', model: 'currency' },
    { path: 'defaultLanguage', model: 'language' }
];


export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
                body('weekend').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('image').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('name.ar').trim().not().isEmpty()
                .withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false };
                        let country = await Country.findOne(query).lean();
                        if (country)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty()
                .withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false };
                        let country = await Country.findOne(query).lean();
                        if (country)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false };
                        let country = await Country.findOne(query).lean();
                        if (country)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('currency').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Currency, { deleted: false });
                        return true;
                    }),
                body('countryCode').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (val, { req }) => {
                    let query = { countryCode: val, deleted: false };
                    let country = await Country.findOne(query).lean();
                    if (country)
                        throw new Error(i18n.__('duplicated'));
                    return true;
                }),
                body('defaultLanguage').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Language, { deleted: false });
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
        else {
            validations = [
                body('weekend').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('image').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false, _id: { $ne: req.params.countryId } };
                        let country = await Country.findOne(query).lean();
                        if (country)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false, _id: { $ne: req.params.countryId } };
                        let country = await Country.findOne(query).lean();
                        if (country)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false, _id: { $ne: req.params.countryId } };
                        let country = await Country.findOne(query).lean();
                        if (country)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('currency').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Currency, { deleted: false });
                        return true;
                    }),
                body('countryCode').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (val, { req }) => {

                    let query = { countryCode: val, deleted: false, _id: { $ne: req.params.countryId } };
                    let country = await Country.findOne(query).lean();
                    if (country)
                        throw new Error(i18n.__('duplicated'));
                    return true;
                }),
                body('defaultLanguage').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Language, { deleted: false });
                        return true;
                    }),
                body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') })
                // body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                //     .custom(async (val) => {
                //         await checkExist(val, Status, { deleted: false });
                //         return true;
                //     })
            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {  removeLanguage ,all,weekend} = req.query;
            let query = { deleted: false };
            let sortQuery = { createdAt: -1 }
            checkDateFilter(req,query,sortQuery);

            if (weekend) {
                query.weekend = weekend;
            }

            let countries;

            let count = await Country.countDocuments(query);
            let pageCount = count;
            if (all) {
                pageCount=1;
                limit = count;
                countries = await Country.find(query).sort(sortQuery).populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                countries = await Country.find(query).sort(sortQuery).limit(limit).skip((page - 1) * limit).populate(populateQuery)
            }
            
            if (!removeLanguage) {
                countries = Country.schema.methods.toJSONLocalizedOnly(countries, i18n.getLocale());
            }
            res.send(new ApiResponse(countries, page, pageCount, limit, count, req));


        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            // if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
            //     return next(new ApiError(403, i18n.__('admin.auth')));
            // }
            let validatedBody = checkValidations(req);
            // if (req.file) {
            //     validatedBody.image = handleImg(req, { attributeName: 'image', isUpdate: false });
            // } else {
            //     return next(new ApiError(404, i18n.__('imageRequired')));
            // }
            let country = await Country.create(validatedBody);
            country = Country.schema.methods.toJSONLocalizedOnly(country, i18n.getLocale());
            res.status(200).send(country);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { countryId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            await checkExist(countryId, Country, { deleted: false });
            let validatedBody = checkValidations(req);
            let data = {};
            if (validatedBody.weekend) {
                data.weekend = validatedBody.weekend;
                delete validatedBody.weekend;
            }
            validatedBody = dotObject.dot(validatedBody);
            let updatedCountry = await Country.findByIdAndUpdate(countryId, {
                ...validatedBody,...data
            }, { new: true });
            if (!removeLanguage)
                updatedCountry = Country.schema.methods.toJSONLocalizedOnly(updatedCountry, i18n.getLocale());
            res.status(200).send(updatedCountry);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { countryId } = req.params;
            let { removeLanguage } = req.query;
            let country = await checkExistThenGet(countryId, Country, { deleted: false });
            if (!removeLanguage) {
                country = Country.schema.methods.toJSONLocalizedOnly(country, i18n.getLocale());
            }
            res.status(200).send(country);

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
            let { countryId } = req.params;
            let country = await checkExistThenGet(countryId, Country, { deleted: false });
            let city = await City.findOne({deleted: false , country:countryId});
            if (city) {
                return next(new ApiError(400, i18n.__('cityExist')));
            }
            country.deleted = true;
            await country.save();
            res.status(200).send("Deleted Successfully");
            // let allCities = await City.find({ deleted: false, country: countryId }).distinct('_id');
            // await City.updateMany({ deleted: false, country: countryId }, { deleted: true })
            // await Region.updateMany({ deleted: false, city: { $in: allCities } }, { deleted: true })
        }
        catch (err) {
            next(err);
        }
    }
}