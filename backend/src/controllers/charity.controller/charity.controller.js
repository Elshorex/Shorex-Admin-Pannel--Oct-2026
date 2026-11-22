import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import {  checkExistThenGet } from "../../helpers/CheckMethods.js";
import { checkValidations, handleImg } from "../shared.controller/shared.controller.js";
import { body } from "express-validator";
import Charity from "../../models/charity.model/charity.model.js";
import i18n from 'i18n'
import dotObject from 'dot-object';
import moment from 'moment'
import companyModel from "../../models/company.model/company.model.js";
export default {

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { name, month, year, all , removeLanguage } = req.query
            let query = { deleted: false };
            if (name) {
                query.$or = [{ 'name.en': { '$regex': name, '$options': 'i' } }, { 'name.ar': { '$regex': name, '$options': 'i' } }]
            }
      
           
            let date = new Date();
            if (month && year) {
                month = month - 1;
                date.setMonth(month);
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('month');
                let endOfDate = moment(date).endOf('month');

                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            if (year && !month) {
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('year');
                let endOfDate = moment(date).endOf('year');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            const categoriesCount = await Charity.count(query);
            let categories;
            let pageCount = categoriesCount;
            if (all) {
                limit = pageCount;
                categories = await Charity.find(query).sort({ createdAt: -1 })
            }
            else {
                pageCount = Math.ceil(categoriesCount / limit);
                categories = await Charity.find(query).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit)
            }
            if (!removeLanguage) {
                categories = Charity.schema.methods.toJSONLocalizedOnly(categories, i18n.getLocale());
            }

            res.send(new ApiResponse(categories, page, pageCount, limit, categoriesCount, req));
        } catch (err) {
            next(err);
        }
    },

    validateBody(isUpdate = false) {
        let validations = [];
        if (!isUpdate) {
            validations = [
                body('lat').not().isEmpty().withMessage(() => { return i18n.__('latRequired') }),
                body('long').not().isEmpty().withMessage(() => { return i18n.__('longRequired') }),
                body('address').not().isEmpty().withMessage(() => { return i18n.__('addressRequired') }),
                body('name.en').not().isEmpty().withMessage(() => { return i18n.__('englishName') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.en': val, deleted: false };
                        let charity = await Charity.findOne(query).lean();
                        if (charity)
                            throw new Error(i18n.__('englishNameDublicated'));
                        return true;
                    }),
                body('name.ar').not().isEmpty().withMessage(() => { return i18n.__('arabicName') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.ar': val, deleted: false };
                        let charity = await Charity.findOne(query).lean();
                        if (charity)
                            throw new Error(i18n.__('arabicNameDublicated'));
                        return true;
                    })
            ];
        }
        else {
            validations = [
                body('lat').not().isEmpty().withMessage(() => { return i18n.__('latRequired') }),
                body('long').not().isEmpty().withMessage(() => { return i18n.__('longRequired') }),
                body('address').not().isEmpty().withMessage(() => { return i18n.__('addressRequired') }),
                
               body('name.en').optional().not().isEmpty().withMessage(() => { return i18n.__('englishName') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.en': val, deleted: false };
                        if (isUpdate)
                            query._id = { $ne: req.params.charityId };
                        let charity = await Charity.findOne(query).lean();
                        if (charity)
                            throw new Error(i18n.__('englishNameDublicated'));
                        return true;
                    }),
                body('name.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('arabicName') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.ar': val, deleted: false };
                        if (isUpdate)
                            query._id = { $ne: req.params.charityId };
                        let charity = await Charity.findOne(query).lean();
                        if (charity)
                            throw new Error(i18n.__('arabicNameDublicated'));
                        return true;
                    })
            ];
        }
        return validations;
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN')
                return next(new ApiError(403, i18n.__('unauthrized')));
            let validatedBody = checkValidations(req);
            if (req.file) {
                let icon = await handleImg(req, { attributeName: 'icon', isUpdate: false }, i18n.__('iconRequired'));
                validatedBody.icon = icon;
            } else {
                return next(new ApiError(400, i18n.__('iconRequired')))
            }
            let old = await Charity.findOne({deleted:false});
            if (old) {
                return next(new ApiError(400,i18n.__('charityExist')));
            }
            let createdcharity = await Charity.create(validatedBody);
            await companyModel.findOneAndUpdate({deleted:false,charity:createdcharity.id});
            createdcharity = Charity.schema.methods.toJSONLocalizedOnly(createdcharity, i18n.getLocale());
            res.status(200).send(createdcharity);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { charityId } = req.params;
            let { removeLanguage } = req.query;
            let charity = await checkExistThenGet(charityId, Charity, { deleted: false });
            if (!removeLanguage) {
                charity = Charity.schema.methods.toJSONLocalizedOnly(charity, i18n.getLocale());
            }
            res.status(200).send(charity);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN')
                return next(new ApiError(403, ('admin.auth')));

            let { charityId } = req.params;
            let { removeLanguage } = req.query;
            let charity = await checkExistThenGet(charityId, Charity, { deleted: false });
            let validatedBody = checkValidations(req);
            
            validatedBody = dotObject.dot(validatedBody);
           
            if (req.file) {
                let icon = await handleImg(req, { attributeName: 'icon', isUpdate: false });
                validatedBody.icon = icon;
            }

            let updatedcharity = await Charity.findByIdAndUpdate(charityId, validatedBody, { new: true });
            if (!removeLanguage) {
                updatedcharity = Charity.schema.methods.toJSONLocalizedOnly(updatedcharity, i18n.getLocale());
            }
            res.status(200).send(updatedcharity);
        }
        catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN')
                return next(new ApiError(403, ('admin.auth')));

            let { charityId } = req.params;
            let charity = await checkExistThenGet(charityId, Charity, { deleted: false, parent: null });
            charity.deleted = true;
            await charity.save();
            res.status(200).send('Deleted Successfully');
        }
        catch (err) {
            next(err);
        }
    },

    validateDeleteMulti() {
        return [
            body('ids').not().isEmpty().withMessage(() => { return i18n.__('idsRequired') }).isArray().withMessage('must be array'),
        ];
    },

    async deleteMuti(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN')
                return next(new ApiError(403, i18n.__('unauthrized')));

            let validatedBody = checkValidations(req);
            await Charity.updateMany({ _id: { $in: validatedBody.ids }, deleted: false }, { deleted: true, deletedDate: new Date() })
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    }
};