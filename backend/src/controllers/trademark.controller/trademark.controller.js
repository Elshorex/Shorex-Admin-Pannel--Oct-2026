import Trademark from "../../models/trademark.model/trademark.model.js";
import Status from "../../models/status.model/status.model.js";

import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import dotObject from 'dot-object'


let populateQuery = [
    { path: 'status', model: 'status' }
];


export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
               
                body('name.ar').trim().not().isEmpty()
                .withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false };
                        let trademark = await Trademark.findOne(query).lean();
                        if (trademark)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty()
                .withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false };
                        let trademark = await Trademark.findOne(query).lean();
                        if (trademark)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false };
                        let trademark = await Trademark.findOne(query).lean();
                        if (trademark)
                            throw new Error(i18n.__('duplicated'));
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
                
                body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false, _id: { $ne: req.params.trademarkId } };
                        let trademark = await Trademark.findOne(query).lean();
                        if (trademark)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false, _id: { $ne: req.params.trademarkId } };
                        let trademark = await Trademark.findOne(query).lean();
                        if (trademark)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false, _id: { $ne: req.params.trademarkId } };
                        let trademark = await Trademark.findOne(query).lean();
                        if (trademark)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Status, { deleted: false });
                        return true;
                    })
            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {  removeLanguage ,all} = req.query;
            let query = { deleted: false };
            let sortQuery = { createdAt: -1 }
            checkDateFilter(req,query,sortQuery);

            let trademarks;

            let count = await Trademark.countDocuments(query);
            let pageCount = count;
            if (all) {
                pageCount=1;
                limit = count;
                trademarks = await Trademark.find(query).sort(sortQuery).populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                trademarks = await Trademark.find(query).sort(sortQuery).limit(limit).skip((page - 1) * limit).populate(populateQuery)
            }
            
            if (!removeLanguage) {
                trademarks = Trademark.schema.methods.toJSONLocalizedOnly(trademarks, i18n.getLocale());
            }
            res.send(new ApiResponse(trademarks, page, pageCount, limit, count, req));


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
            
            let trademark = await Trademark.create(validatedBody);
            trademark = Trademark.schema.methods.toJSONLocalizedOnly(trademark, i18n.getLocale());
            res.status(200).send(trademark);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { trademarkId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            await checkExist(trademarkId, Trademark, { deleted: false });
            let validatedBody = checkValidations(req);
            
            
            validatedBody = dotObject.dot(validatedBody);
            let updatedCountry = await Trademark.findByIdAndUpdate(trademarkId, validatedBody , { new: true });
            if (!removeLanguage)
                updatedCountry = Trademark.schema.methods.toJSONLocalizedOnly(updatedCountry, i18n.getLocale());
            res.status(200).send(updatedCountry);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { trademarkId } = req.params;
            let { removeLanguage } = req.query;
            let trademark = await checkExistThenGet(trademarkId, Trademark, { deleted: false });
            if (!removeLanguage) {
                trademark = Trademark.schema.methods.toJSONLocalizedOnly(trademark, i18n.getLocale());
            }
            res.status(200).send(trademark);

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
            let { trademarkId } = req.params;
            let trademark = await checkExistThenGet(trademarkId, Trademark, { deleted: false });

            // to be handled after adding vheicle
            // let city = await City.findOne({deleted: false , trademark:trademarkId});
            // if (city) {
            //     return next(new ApiError(400, i18n.__('cityExist')));
            // }
            trademark.deleted = true;
            await trademark.save();
            res.status(200).send("Deleted Successfully");
            
        }
        catch (err) {
            next(err);
        }
    }
}