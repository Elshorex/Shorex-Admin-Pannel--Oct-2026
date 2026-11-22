import Slider from '../../models/slider.model/slider.model.js';
import User from '../../models/user.model/user.model.js';
import { body } from 'express-validator';
import { checkValidations, handleImg } from '../shared.controller/shared.controller.js';
import { checkExist, checkExistThenGet } from '../../helpers/CheckMethods.js';
import ApiResponse from '../../helpers/ApiResponse.js';
import ApiError from '../../helpers/ApiError.js';
import i18n from 'i18n'
import moment from 'moment';
import dotObject from 'dot-object';
import Category from "../../models/category.model/category.model.js";
import Product from "../../models/product.model/product.model.js";

let populateQuery = [
    { path: 'product', model: 'product' }, { path: 'category', model: 'category' }
];

export default {
    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = { deleted: false };
            let { title, month, year, archive, removeLanguage, product,category,institution} = req.query;

            if (archive) query.deleted = true;
            if (title) query.$or = [{ 'title.ar': { '$regex': title, '$options': 'i' } }, { 'title.en': { '$regex': title, '$options': 'i' } }]

            if(product) query.product = product;
            if(category) query.category = category;
            if(institution) query.institution = institution;
            if (month && year) {
                let date = new Date();
                month = month - 1;
                date.setMonth(month);
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('month');
                let endOfDate = moment(date).endOf('month');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            if (year && !month) {
                let date = new Date();
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('year');
                let endOfDate = moment(date).endOf('year');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            let allDocs = await Slider.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit).populate(populateQuery)


            if (!removeLanguage) {
                allDocs = await Slider.schema.methods.toJSONLocalizedOnly(allDocs, i18n.getLocale());
            }
            let totalCount = await Slider.count(query);
            let pageCount = Math.ceil(totalCount / limit);
            res.send(new ApiResponse(allDocs, page, pageCount, limit, totalCount, req));
        } catch (error) {
            next(error)
        }
    },

    validateBody(isUpdate = false) {
        let validations = [];
        if (!isUpdate) {
            validations = [
                body('title.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('arTitleRequired') }),
                body('title.en').optional().not().isEmpty().withMessage(() => { return i18n.__('enTitleRequired') }),
                body('category').optional().not().isEmpty().withMessage(() => { return i18n.__('categoryRequired') })
                    .custom(async (value) => {
                        return true;
                    }),
                body('product').optional().not().isEmpty().withMessage(() => { return i18n.__('productRequired') })
                    .custom(async (value) => {
                        await checkExist(value, Product, { deleted: false });
                        return true;
                    }),
                // body('institution').optional().not().isEmpty().withMessage(() => { return i18n.__('productRequired') })
                //     .custom(async (value) => {
                //         await checkExist(value, User, { deleted: false });
                //         return true;
                //     }),
                
            ];
        }
        else {
            validations = [
                body('title.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('arTitleRequired') }),
                body('title.en').optional().not().isEmpty().withMessage(() => { return i18n.__('enTitleRequired') }),
                body('category').optional().not().isEmpty().withMessage(() => { return i18n.__('categoryRequired') })
                    .custom(async (value) => {
                        await checkExist(value, Category, { deleted: false });
                        return true;
                    }),
                body('product').optional().not().isEmpty().withMessage(() => { return i18n.__('productRequired') })
                    .custom(async (value) => {
                        await checkExist(value, Product, { deleted: false });
                        return true;
                    }),
                // body('institution').optional().not().isEmpty().withMessage(() => { return i18n.__('productRequired') })
                //     .custom(async (value) => {
                //         await checkExist(value, User, { deleted: false });
                //         return true;
                //     }),
                
            ];
        }
        return validations;
    },

    async create(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            validatedBody.user = req.user.id;
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'image' });
                validatedBody.image = image;
            } else {
                return next(new ApiError(404, i18n.__('SliderImageRequired')))
            }
            let createdSlider = await Slider.create(validatedBody);
            res.status(200).send(createdSlider);
        } catch (error) {
            next(error)
        }
    },
    async findById(req, res, next) {
        try {
            let { id } = req.params;
            let { removeLanguage } = req.query;
            let slider = await checkExistThenGet(id, Slider, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                slider = await Slider.schema.methods.toJSONLocalizedOnly(slider, i18n.getLocale());
            }
            res.status(200).send(slider);
        } catch (error) {
            next(error)
        }
    },
    async update(req, res, next) {
        try {
            let { id } = req.params;
            let { removeLanguage } = req.query;
            let slider = await checkExistThenGet(id, Slider, { deleted: false });
            let validatedBody = checkValidations(req);
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'image' });
                validatedBody.image = image;
            }
            validatedBody = dotObject.dot(validatedBody);
            if (!validatedBody.category && slider.category) {
                validatedBody.$unset = { category: 1 }
            }
            // if (!validatedBody.institution && slider.institution) {
            //     validatedBody.$unset = { institution: 1 }
            // }
            if (!validatedBody.product && slider.product) {
                validatedBody.$unset = { product: 1 }
            }
            if (!validatedBody.product && !validatedBody.category) {
                validatedBody.$unset = { product: 1, category: 1 }
            }
            if (!validatedBody.title && (slider.title && slider.title.ar)) {
                validatedBody.$unset = { 'title.ar': "" }
            }
            let updatedSlider = await Slider.findByIdAndUpdate(id, validatedBody, { new: true }).populate(populateQuery)
            if (!removeLanguage) {
                updatedSlider = await Slider.schema.methods.toJSONLocalizedOnly(updatedSlider, i18n.getLocale());

            }
            res.status(200).send(updatedSlider);
        } catch (error) {
            next(error)
        }
    },
    async delete(req, res, next) {
        try {
            let { id } = req.params;
            let slider = await checkExistThenGet(id, Slider, { deleted: false });
            slider.deleted = true;
            await slider.save();
            res.status(200).send('Deleted Successfully');
        } catch (error) {
            next(error)
        }
    },
}
