import Holiday from "../../models/holidays.model/holidays.model.js";
import Country from "../../models/country.model/country.model.js";
import moment from 'moment'

import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import dotObject from 'dot-object'
import i18n from 'i18n';
let populateQuery = [ { path: 'country', model: 'country' }];



export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
                body('holidayName').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('ranges').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('ranges.*.fromDate').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('ranges.*.toDate').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('ranges.*.duration').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('holidayYear').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('type').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isIn(['PUBLIC','MAINTENANCE']).withMessage(() => { return i18n.__('invalid') }),
                body('name.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false, country: req.body.country };
                        let holiday = await Holiday.findOne(query).lean();
                        if (holiday)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false, country: req.body.country };
                        let holiday = await Holiday.findOne(query).lean();
                        if (holiday)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false, country: req.body.country };
                        let holiday = await Holiday.findOne(query).lean();
                        if (holiday)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('country').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Country, { deleted: false });
                    return true;
                })
            ];
        }
        else {
            validations = [
                body('holidayName').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('ranges').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('ranges.*.fromDate').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('ranges.*.toDate').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('ranges.*.duration').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('holidayYear').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('type').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isIn(['PUBLIC','MAINTENANCE']).withMessage(() => { return i18n.__('invalid') }),
                body('name.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false,  _id: { $ne: req.params.holidayId } };
                        let holiday = await Holiday.findOne(query).lean();
                        if (holiday)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false,  _id: { $ne: req.params.holidayId } };
                        let holiday = await Holiday.findOne(query).lean();
                        if (holiday)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false,  _id: { $ne: req.params.holidayId } };
                        let holiday = await Holiday.findOne(query).lean();
                        if (holiday)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('country').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Country, { deleted: false });
                    return true;
                })
            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {  country,holidayYear,all,removeLanguage,holidayName,from,to} = req.query;
            let query = { deleted: false };
            let sortQuery = { _id: -1 };

            checkDateFilter(req,query,sortQuery)
                
            if (country) query.country = country;
            if (holidayYear) query.holidayYear = holidayYear;
            if (holidayName) {
                query.holidayName = { '$regex': holidayName, '$options': 'i' };
            }
            if (from) {
                query['ranges.fromDate'] = {$gte:from}
            }
            if (to) {
                let endOfDate = moment(to).endOf('day');
                query['ranges.toDate'] = {$lte:  new Date(endOfDate) }
            }

            let count = await Holiday.countDocuments(query);
            let pageCount = count;
            let holidays;
            if (all) {
                pageCount=1;
                limit = count;
                holidays = await Holiday.find(query).sort(sortQuery)
                    .populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                holidays = await Holiday.find(query).sort(sortQuery)
                .limit(limit).skip((page - 1) * limit)
                    .populate(populateQuery);
            }

            if (!removeLanguage) {
                holidays = Holiday.schema.methods.toJSONLocalizedOnly(holidays, i18n.getLocale());
            }
            
            res.send(new ApiResponse(holidays, page, pageCount, limit, count, req));

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
            let holiday = await Holiday.create(validatedBody);
            holiday = await Holiday.populate(holiday, populateQuery);
            holiday = Holiday.schema.methods.toJSONLocalizedOnly(holiday, i18n.getLocale());
            res.status(200).send(holiday);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { holidayId } = req.params;
            let { removeLanguage } = req.query;            
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            await checkExist(holidayId, Holiday, { deleted: false });
            let validatedBody = checkValidations(req);

            let data = {};
            if (validatedBody.ranges) {
                data.ranges = validatedBody.ranges;
                delete validatedBody.ranges; 
            }

            validatedBody = dotObject.dot(validatedBody);
            
            let updatedCity = await Holiday.findByIdAndUpdate(holidayId, {...validatedBody,...data}, { new: true });
            if(! removeLanguage) 
                updatedCity = Holiday.schema.methods.toJSONLocalizedOnly(updatedCity, i18n.getLocale());
            res.status(200).send(updatedCity);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { holidayId } = req.params;
            let { removeLanguage } = req.query;
            let holiday = await checkExistThenGet(holidayId, Holiday, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                holiday = Holiday.schema.methods.toJSONLocalizedOnly(holiday, i18n.getLocale());
            }
            res.status(200).send(holiday);

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
            let { holidayId } = req.params;
            let holiday = await checkExistThenGet(holidayId, Holiday, { deleted: false });
            
            holiday.deleted = true;
            await holiday.save();
            res.status(200).send("Deleted Successfully");

        }
        catch (err) {
            next(err);
        }
    }
}