import Language from "../../models/language.model/language.model.js";
import Status from "../../models/status.model/status.model.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist ,checkDateFilter} from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import dotObject from 'dot-object'
import moment from 'moment';

let popQuery = [{ path: 'status', model: 'status' }]

export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            
            validations = [

                body('key').not().isEmpty().withMessage(() => { return i18n.__('fieldRequired') }),
                body('name.ar').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false };
                        let language = await Language.findOne(query).lean();
                        if (language)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false };
                        let language = await Language.findOne(query).lean();
                        if (language)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.es': val, deleted: false };
                        let language = await Language.findOne(query).lean();
                        if (language)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('direction').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isIn(['ltr','rtl']),
                // body('activated').optional().not().isEmpty().withMessage(() => { return i18n.__('activatedRequired') })
                // .isBoolean()
                body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async(val)=>{
                    await checkExist(val,Status,{deleted:false});
                    return true;
                })
            ];
        }
        else {
            validations = [
                body('key').optional().not().isEmpty().withMessage(() => { return i18n.__('fieldRequired') }),
                // body('code').optional().not().isEmpty().withMessage(() => { return i18n.__('codeRequired') }),
                body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false, _id: { $ne: req.params.languageId } };
                        let language = await Language.findOne(query).lean();
                        if (language)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false, _id: { $ne: req.params.languageId } };
                        let language = await Language.findOne(query).lean();
                        if (language)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false, _id: { $ne: req.params.languageId } };
                        let language = await Language.findOne(query).lean();
                        if (language)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('direction').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isIn(['ltr','rtl']),
                // body('activated').optional().not().isEmpty().withMessage(() => { return i18n.__('activatedRequired') })
                // .isBoolean()
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
            
            let languages = await Language.find(query).sort(sortQuery).populate(popQuery);
            if (!removeLanguage) {
                languages = Language.schema.methods.toJSONLocalizedOnly(languages, i18n.getLocale());
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
            let language = await Language.create(validatedBody);
            language = Language.schema.methods.toJSONLocalizedOnly(language, i18n.getLocale());
            res.status(200).send(language);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { languageId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;            
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            await checkExist(languageId, Language, { deleted: false });
            let validatedBody = checkValidations(req);
            validatedBody = dotObject.dot(validatedBody);
            let updatedCountry = await Language.findByIdAndUpdate(languageId, { ...validatedBody}, { new: true });
            if(!removeLanguage)
                updatedCountry = Language.schema.methods.toJSONLocalizedOnly(updatedCountry, i18n.getLocale());
            res.status(200).send(updatedCountry);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { languageId } = req.params;
            let { removeLanguage } = req.query;            
            let language = await checkExistThenGet(languageId, Language, { deleted: false });
            if (! removeLanguage) {
                language = Language.schema.methods.toJSONLocalizedOnly(language, i18n.getLocale());
            }
            res.status(200).send(language);

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
            let { languageId } = req.params;
            let language = await checkExistThenGet(languageId, Language, { deleted: false });
            language.deleted = true;
            await language.save();
            res.status(200).send("Deleted Successfully");
            
        }
        catch (err) {
            next(err);
        }
    }
}