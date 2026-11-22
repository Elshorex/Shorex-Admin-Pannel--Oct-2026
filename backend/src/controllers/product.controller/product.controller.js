import Product from "../../models/product.model/product.model.js";
import Category from "../../models/category.model/category.model.js";
import Country from "../../models/country.model/country.model.js";
import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import dotObject from 'dot-object'


let populateQuery = [
    { path: 'productCategory', model: 'category'},
    { path: 'country', model: 'country' }
];


export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
                body('image').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('name.ar').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false };
                        let product = await Product.findOne(query).lean();
                        if (product)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false };
                        let product = await Product.findOne(query).lean();
                        if (product)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false };
                        let product = await Product.findOne(query).lean();
                        if (product)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('points').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('quantityQuestion.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('quantityQuestion.en').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('quantityQuestion.es').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('productCategory').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Category, { deleted: false });
                        return true;
                    }),
                body('country').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Country, { deleted: false });
                        return true;
                    })
            ];
        }
        else {
            validations = [
                body('image').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('name.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false, _id: { $ne: req.params.productId } };
                        let product = await Product.findOne(query).lean();
                        if (product)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false, _id: { $ne: req.params.productId } };
                        let product = await Product.findOne(query).lean();
                        if (product)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.es').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.es': val, deleted: false, _id: { $ne: req.params.productId } };
                        let product = await Product.findOne(query).lean();
                        if (product)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('points').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('quantityQuestion.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('quantityQuestion.en').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('quantityQuestion.es').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('productCategory').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Category, { deleted: false });
                        return true;
                    }),
                body('country').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
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
            let { removeLanguage, all, country } = req.query;
            let query = { deleted: false };
            
            // Filter by country if provided
            if (country) {
                query.country = country;
            }
            
            let sortQuery = { createdAt: -1 }
            checkDateFilter(req, query, sortQuery);
            let products;

            // let count = await Product.count(query);
            let count = await Product.countDocuments(query);
            
            let pageCount = count;
            if (all) {
                pageCount = 1;
                limit = count;
                products = await Product.find(query).sort(sortQuery).populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                products = await Product.find(query).sort(sortQuery).limit(limit).skip((page - 1) * limit).populate(populateQuery)
            }

            if (!removeLanguage) {
                products = Product.schema.methods.toJSONLocalizedOnly(products, i18n.getLocale());
            }
            res.send(new ApiResponse(products, page, pageCount, limit, count, req));


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
            
            let product = await Product.create(validatedBody);
            product = await Product.findById(product._id).populate(populateQuery);
            product = Product.schema.methods.toJSONLocalizedOnly(product, i18n.getLocale());
            res.status(200).send(product);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { productId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            await checkExist(productId, Product, { deleted: false });
            let validatedBody = checkValidations(req);
            let data = {};
            
            validatedBody = dotObject.dot(validatedBody);
            let updatedProduct = await Product.findByIdAndUpdate(productId, {  ...validatedBody, ...data }, { new: true }).populate(populateQuery);
            if (!removeLanguage)
                updatedProduct = Product.schema.methods.toJSONLocalizedOnly(updatedProduct, i18n.getLocale());
            res.status(200).send(updatedProduct);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { productId } = req.params;
            let { removeLanguage } = req.query;
            let product = await checkExistThenGet(productId, Product, { deleted: false ,populate:populateQuery});
            if (!removeLanguage) {
                product = Product.schema.methods.toJSONLocalizedOnly(product, i18n.getLocale());
            }
            res.status(200).send(product);

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
            let { productId } = req.params;
            let product = await checkExistThenGet(productId, Product, { deleted: false });
            
            product.deleted = true;
            await product.save({ validateBeforeSave: false });
            res.status(200).send("Deleted Successfully");
            
        }
        catch (err) {
            next(err);
        }
    }
}