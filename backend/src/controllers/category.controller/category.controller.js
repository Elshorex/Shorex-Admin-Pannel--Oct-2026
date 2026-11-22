import Category from "../../models/category.model/category.model.js";
import Status from "../../models/status.model/status.model.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist ,checkDateFilter} from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import dotObject from 'dot-object'

let popQuery = [{ path: 'status', model: 'status' }]

export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            
            validations = [

                body('name.ar').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false };
                        let category = await Category.findOne(query).lean();
                        if (category)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false };
                        let category = await Category.findOne(query).lean();
                        if (category)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.es': val, deleted: false };
                        let category = await Category.findOne(query).lean();
                        if (category)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async(val)=>{
                    await checkExist(val,Status,{deleted:false});
                    return true;
                })
            ];
        }
        else {
            validations = [
                body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false, _id: { $ne: req.params.categoryId } };
                        let category = await Category.findOne(query).lean();
                        if (category)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false, _id: { $ne: req.params.categoryId } };
                        let category = await Category.findOne(query).lean();
                        if (category)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false, _id: { $ne: req.params.categoryId } };
                        let category = await Category.findOne(query).lean();
                        if (category)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async(val)=>{
                    await checkExist(val,Status,{deleted:false});
                    return true;
                })

            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let {  removeLanguage } = req.query;
            let query = { deleted: false };
            let sortQuery = { createdAt: -1 };

            checkDateFilter(req,query,sortQuery);
            
            let languages = await Category.find(query).sort(sortQuery).populate(popQuery);
            if (!removeLanguage) {
                languages = Category.schema.methods.toJSONLocalizedOnly(languages, i18n.getLocale());
            }
            res.send({data: languages});
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
            let category = await Category.create(validatedBody);
            category = Category.schema.methods.toJSONLocalizedOnly(category, i18n.getLocale());
            res.status(200).send(category);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { categoryId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;            
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            await checkExist(categoryId, Category, { deleted: false });
            let validatedBody = checkValidations(req);
            validatedBody = dotObject.dot(validatedBody);
            let updatedCountry = await Category.findByIdAndUpdate(categoryId, { ...validatedBody}, { new: true });
            if(!removeLanguage)
                updatedCountry = Category.schema.methods.toJSONLocalizedOnly(updatedCountry, i18n.getLocale());
            res.status(200).send(updatedCountry);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { categoryId } = req.params;
            let { removeLanguage } = req.query;            
            let category = await checkExistThenGet(categoryId, Category, { deleted: false });
            if (! removeLanguage) {
                category = Category.schema.methods.toJSONLocalizedOnly(category, i18n.getLocale());
            }
            res.status(200).send(category);

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
            let { categoryId } = req.params;
            let category = await checkExistThenGet(categoryId, Category, { deleted: false });
            category.deleted = true;
            await category.save();
            res.status(200).send("Deleted Successfully");
            
        }
        catch (err) {
            next(err);
        }
    }
}