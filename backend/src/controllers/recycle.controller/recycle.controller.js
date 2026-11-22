import Recycle from "../../models/recycle.model/recycle.model.js";
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
                body('image').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('name.ar').trim().not().isEmpty()
                .withMessage(() => { return i18n.__('filedRequired') }),
                body('name.en').optional().trim().not().isEmpty()
                .withMessage(() => { return i18n.__('filedRequired') }),
                body('name.es').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                
                body('description.ar').trim().not().isEmpty()
                .withMessage(() => { return i18n.__('filedRequired') }),
                body('description.en').optional().trim().not().isEmpty()
                .withMessage(() => { return i18n.__('filedRequired') }),
                body('description.es').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                
                
                
                body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Status, { deleted: false });
                        return true;
                    })
            ];
        }
        else {
            validations = [
                body('image').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),

                
                body('description.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('description.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('description.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),

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

           

            let recycles;

            let count = await Recycle.count(query);
            let pageCount = count;
            if (all) {
                pageCount=1;
                limit = count;
                recycles = await Recycle.find(query).sort(sortQuery).populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                recycles = await Recycle.find(query).sort(sortQuery).limit(limit).skip((page - 1) * limit).populate(populateQuery)
            }
            
            if (!removeLanguage) {
                recycles = Recycle.schema.methods.toJSONLocalizedOnly(recycles, i18n.getLocale());
            }
            res.send(new ApiResponse(recycles, page, pageCount, limit, count, req));


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
            
            let recycle = await Recycle.create(validatedBody);
            recycle = Recycle.schema.methods.toJSONLocalizedOnly(recycle, i18n.getLocale());
            res.status(200).send(recycle);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { recycleId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            await checkExist(recycleId, Recycle, { deleted: false });
            let validatedBody = checkValidations(req);
            validatedBody = dotObject.dot(validatedBody);
            let updatedCountry = await Recycle.findByIdAndUpdate(recycleId, validatedBody, { new: true });
            if (!removeLanguage)
                updatedCountry = Recycle.schema.methods.toJSONLocalizedOnly(updatedCountry, i18n.getLocale());
            res.status(200).send(updatedCountry);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { recycleId } = req.params;
            let { removeLanguage } = req.query;
            let recycle = await checkExistThenGet(recycleId, Recycle, { deleted: false });
            if (!removeLanguage) {
                recycle = Recycle.schema.methods.toJSONLocalizedOnly(recycle, i18n.getLocale());
            }
            res.status(200).send(recycle);

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
            let { recycleId } = req.params;
            let recycle = await checkExistThenGet(recycleId, Recycle, { deleted: false });
            
            recycle.deleted = true;
            await recycle.save();
            res.status(200).send("Deleted Successfully");
            
        }
        catch (err) {
            next(err);
        }
    }
}