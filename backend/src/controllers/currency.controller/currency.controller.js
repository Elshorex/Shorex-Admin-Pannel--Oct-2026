import Currency from "../../models/currency.model/currency.model.js";
import Status from "../../models/status.model/status.model.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
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

                // body('code').not().isEmpty().withMessage(() => { return i18n.__('codeRequired') }),
                body('name.ar').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false };
                        let currency = await Currency.findOne(query).lean();
                        if (currency)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false };
                        let currency = await Currency.findOne(query).lean();
                        if (currency)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.es': val, deleted: false };
                        let currency = await Currency.findOne(query).lean();
                        if (currency)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('symbol').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('precision').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                // body('activated').optional().not().isEmpty().withMessage(() => { return i18n.__('activatedRequired') })
                //     .isBoolean()
                body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async(val)=>{
                        await checkExist(val,Status,{deleted:false});
                        return true;
                    })

            ];
        }
        else {
            validations = [
                // body('code').optional().not().isEmpty().withMessage(() => { return i18n.__('codeRequired') }),
                body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false, _id: { $ne: req.params.currencyId } };
                        let currency = await Currency.findOne(query).lean();
                        if (currency)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false, _id: { $ne: req.params.currencyId } };
                        let currency = await Currency.findOne(query).lean();
                        if (currency)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false, _id: { $ne: req.params.currencyId } };
                        let currency = await Currency.findOne(query).lean();
                        if (currency)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('symbol').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('precision').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                // body('activated').optional().not().isEmpty().withMessage(() => { return i18n.__('activatedRequired') })
                //     .isBoolean()
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

            checkDateFilter(req, query, sortQuery);

            let currencies = await Currency.find(query).sort(sortQuery).populate(popQuery);
            if (!removeLanguage) {
                currencies = Currency.schema.methods.toJSONLocalizedOnly(currencies, i18n.getLocale());
            }
            res.send({ data: currencies });
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
            let currency = await Currency.create(validatedBody);
            currency = Currency.schema.methods.toJSONLocalizedOnly(currency, i18n.getLocale());
            res.status(200).send(currency);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { currencyId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            await checkExist(currencyId, Currency, { deleted: false });
            let validatedBody = checkValidations(req);
            validatedBody = dotObject.dot(validatedBody);
            let updatedCountry = await Currency.findByIdAndUpdate(currencyId, { ...validatedBody }, { new: true });
            if (!removeLanguage)
                updatedCountry = Currency.schema.methods.toJSONLocalizedOnly(updatedCountry, i18n.getLocale());
            res.status(200).send(updatedCountry);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { currencyId } = req.params;
            let { removeLanguage } = req.query;
            let currency = await checkExistThenGet(currencyId, Currency, { deleted: false });
            if (!removeLanguage) {
                currency = Currency.schema.methods.toJSONLocalizedOnly(currency, i18n.getLocale());
            }
            res.status(200).send(currency);

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
            let { currencyId } = req.params;
            let currency = await checkExistThenGet(currencyId, Currency, { deleted: false });
            currency.deleted = true;
            await currency.save();
            res.status(200).send("Deleted Successfully");

        }
        catch (err) {
            next(err);
        }
    }
}