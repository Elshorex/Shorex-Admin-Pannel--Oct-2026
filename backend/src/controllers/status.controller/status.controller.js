import Status from "../../models/status.model/status.model.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist ,checkDateFilter} from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations, handleImg } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import dotObject from 'dot-object'
import moment from 'moment'

export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            
            validations = [

                body('name.ar').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false };
                        let status = await Status.findOne(query).lean();
                        if (status)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false };
                        let status = await Status.findOne(query).lean();
                        if (status)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.es': val, deleted: false };
                        let status = await Status.findOne(query).lean();
                        if (status)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    })

            ];
        }
        else {
            validations = [
                body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false, _id: { $ne: req.params.statusId } };
                        let status = await Status.findOne(query).lean();
                        if (status)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false, _id: { $ne: req.params.statusId } };
                        let status = await Status.findOne(query).lean();
                        if (status)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false, _id: { $ne: req.params.statusId } };
                        let status = await Status.findOne(query).lean();
                        if (status)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    })
            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let { name , removeLanguage } = req.query;
            let query = { deleted: false };
            let sortQuery = { createdAt: -1 };

            checkDateFilter(req,query,sortQuery);

            
            
            let statuses = await Status.find(query).sort(sortQuery);
            if (!removeLanguage) {
                statuses = Status.schema.methods.toJSONLocalizedOnly(statuses, i18n.getLocale());
            }
            res.send({data: statuses});
        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            if ( !['ADMIN','SUB_ADMIN'].includes(user.type) ) {
                return next(new ApiError(403,i18n.__('admin.auth')));
            }
            let validatedBody = checkValidations(req);
            let status = await Status.create(validatedBody);
            status = Status.schema.methods.toJSONLocalizedOnly(status, i18n.getLocale());
            res.status(200).send(status);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { statusId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;            
            if ( !['ADMIN','SUB_ADMIN'].includes(user.type) ) {
                return next(new ApiError(403,i18n.__('admin.auth')));
            }
            await checkExist(statusId, Status, { deleted: false });
            let validatedBody = checkValidations(req);
            validatedBody = dotObject.dot(validatedBody);
            let updatedCountry = await Status.findByIdAndUpdate(statusId, { ...validatedBody}, { new: true });
            if(!removeLanguage)
                updatedCountry = Status.schema.methods.toJSONLocalizedOnly(updatedCountry, i18n.getLocale());
            res.status(200).send(updatedCountry);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { statusId } = req.params;
            let { removeLanguage } = req.query;            
            let status = await checkExistThenGet(statusId, Status, { deleted: false });
            if (! removeLanguage) {
                status = Status.schema.methods.toJSONLocalizedOnly(status, i18n.getLocale());
            }
            res.status(200).send(status);

        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user;
            if ( !['ADMIN','SUB_ADMIN'].includes(user.type) ) {
                return next(new ApiError(403,i18n.__('admin.auth')));
            }
            let { statusId } = req.params;
            let status = await checkExistThenGet(statusId, Status, { deleted: false });
            status.deleted = true;
            await status.save();
            res.status(200).send("Deleted Successfully");
            
        }
        catch (err) {
            next(err);
        }
    }
}