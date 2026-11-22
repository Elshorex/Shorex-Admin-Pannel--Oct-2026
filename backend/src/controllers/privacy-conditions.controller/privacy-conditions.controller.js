import Privacy from "../../models/privacy-conditions.model/privacy-conditions.model.js";
import Country from "../../models/country.model/country.model.js";
import Status from "../../models/status.model/status.model.js";

import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import dotObject from 'dot-object';
let populateQuery = [
    { path: 'status', model: 'status' },
    { path: 'country', model: 'country' },
];



export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [

                body('type').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isIn(['PRIVACY_POLICY','TERMS_CONDITION']),
                body('description.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('description.en').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('description.es').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
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
        else {
            validations = [
                body('description.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('description.en').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('description.es').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
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

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {  country,all,removeLanguage,type} = req.query;
            let query = { deleted: false };
            let sortQuery = { _id: -1 };

            checkDateFilter(req,query,)
                
            if (country) query.country = country;
            if (type) query.type = type;

            let count = await Privacy.countDocuments(query);
            let pageCount = count;
            let privacies;
            if (all) {
                pageCount=1;
                limit = count;
                privacies = await Privacy.find(query).sort(sortQuery)
                    .populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                privacies = await Privacy.find(query).sort(sortQuery)
                .limit(limit).skip((page - 1) * limit)
                    .populate(populateQuery);
            }

            if (!removeLanguage) {
                privacies = Privacy.schema.methods.toJSONLocalizedOnly(privacies, i18n.getLocale());
            }
            
            res.send(new ApiResponse(privacies, page, pageCount, limit, count, req));

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
            let privacy = await Privacy.create(validatedBody);
            privacy = await Privacy.populate(privacy, populateQuery);
            privacy = Privacy.schema.methods.toJSONLocalizedOnly(privacy, i18n.getLocale());
            res.status(200).send(privacy);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { privacyId } = req.params;
            let { removeLanguage } = req.query;            
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            await checkExist(privacyId, Privacy, { deleted: false });
            let validatedBody = checkValidations(req);
            validatedBody = dotObject.dot(validatedBody);
            let updatedPrivacy = await Privacy.findByIdAndUpdate(privacyId, validatedBody, { new: true });
            if(! removeLanguage) 
                updatedPrivacy = Privacy.schema.methods.toJSONLocalizedOnly(updatedPrivacy, i18n.getLocale());
            res.status(200).send({ privacy: updatedPrivacy});
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { privacyId } = req.params;
            let { removeLanguage } = req.query;
            let privacy = await checkExistThenGet(privacyId, Privacy, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                privacy = Privacy.schema.methods.toJSONLocalizedOnly(privacy, i18n.getLocale());
            }
            res.status(200).send(privacy);

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
            let { privacyId } = req.params;
            let privacy = await checkExistThenGet(privacyId, Privacy, { deleted: false });
            
            privacy.deleted = true;
            await privacy.save();
            res.status(200).send("Deleted Successfully");

        }
        catch (err) {
            next(err);
        }
    }
}