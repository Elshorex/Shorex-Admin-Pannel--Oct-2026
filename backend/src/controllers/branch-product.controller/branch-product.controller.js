import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExist, checkExistThenGet } from "../../helpers/CheckMethods.js";
import { checkValidations, handleImg } from "../shared.controller/shared.controller.js";
import { body } from "express-validator";
import BranchProduct from "../../models/branche-product.model/branche-product.model.js";
import Product from "../../models/product.model/product.model.js";
import i18n from 'i18n'
import dotObject from 'dot-object';
import moment from 'moment'


let populateQuery = [{ path: 'product', model: 'product',populate:[{ path: 'productCategory', model: 'category' }] },{ path: 'branch', model: 'user' }];

export default {

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {  month, year, all , removeLanguage , branch,product,
                name,price,category ,offer} = req.query
            let query = {
                deleted: false
            };

            if(name || price || category || offer){
                
                let productQuery = {deleted: false}
                if (offer) productQuery.offer = offer;
                if (price) productQuery.price = price;
                if (name) {
                    productQuery.$or = [{ 'name.en': { '$regex': name, '$options': 'i' } }, { 'name.ar': { '$regex': name, '$options': 'i' } }]
                }
                if (category) productQuery.productCategory = category;
    
                let products = await Product.find(productQuery).distinct('_id');
                query.product = {$in:products};

            }

            
            if (branch) query.branch = branch;
            if (product) query.product = product;
            
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
            const productsCount = await BranchProduct.count(query);
            let products;
            let pageCount = productsCount;
            if (all) {
                limit = pageCount;
                products = await BranchProduct.find(query).populate(populateQuery).sort({ createdAt: -1 })
            }
            else {
                pageCount = Math.ceil(productsCount / limit);
                products = await BranchProduct.find(query).populate(populateQuery).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit)
            }
            if (!removeLanguage) {
                products = BranchProduct.schema.methods.toJSONLocalizedOnly(products, i18n.getLocale());
            }

            res.send(new ApiResponse(products, page, pageCount, limit, productsCount, req));
        } catch (err) {
            next(err);
        }
    },


    async checkProductsBranch(req, res, next) {
        try {
            
            let user = req.user;
            let validatedBody = checkValidations(req);

            let branch = validatedBody.branch || ( user.headBranch ? user.headBranch : user.id);
            
            let products = await BranchProduct.find({
                deleted:false,
                branch:validatedBody.branch,
                product:{$in:validatedBody.products}
            });

            let exist = true;
            if (products.length != validatedBody.products.length) {
               exist = false
            }
            res.status(200).send({exist});
 

        } catch (err) {
            next(err);
        }
    },

    validateBody(isUpdate = false) {
        let validations = [];
        if (!isUpdate) {
            validations = [
                body('branch').optional().not().isEmpty().withMessage(() => { return i18n.__('branchRequired') }),
                body('products').optional().not().isEmpty().withMessage(() => { return i18n.__('productRequired') }),
                body('product').optional().not().isEmpty().withMessage(() => { return i18n.__('productRequired') })
                    .custom(async (val, { req }) => {
                        await checkExist(val,Product,{deleted:false});
                        return true;
                    })
            ];
        }
        else {
            validations = [
                body('product').optional().not().isEmpty().withMessage(() => { return i18n.__('arabicName') })
                    .custom(async (val, { req }) => {
                        await checkExist(val,Product,{deleted:false});
                        return true;
                    })
            ];
        }
        return validations;
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            
            let validatedBody = checkValidations(req);
            validatedBody.branch = validatedBody.branch || ( user.headBranch ? user.headBranch : user.id);

            let old = await BranchProduct.findOne({deleted:false,...validatedBody});

            let product;
            if (old) {
                product = old;
            }else{
                product = await BranchProduct.create(validatedBody);
            }
            
            res.status(200).send(product);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { branchProductId } = req.params;
            let { removeLanguage } = req.query;
            let product = await checkExistThenGet(branchProductId, BranchProduct, { deleted: false ,populate:populateQuery});
            if (!removeLanguage) {
                product = BranchProduct.schema.methods.toJSONLocalizedOnly(product, i18n.getLocale());
            }
            res.status(200).send(product);
        } catch (err) {
            next(err);
        }
    },

    // async update(req, res, next) {
    //     try {
    //         let user = req.user;

    //         let { branchProductId } = req.params;
    //         let { removeLanguage } = req.query;
    //         let product = await checkExistThenGet(branchProductId, BranchProduct, { deleted: false });
    //         let validatedBody = checkValidations(req);
            
    //         validatedBody = dotObject.dot(validatedBody);
           
    //         if (req.file) {
    //             let icon = await handleImg(req, { attributeName: 'icon', isUpdate: false });
    //             validatedBody.icon = icon;
    //         }

    //         let updatedCategory = await BranchProduct.findByIdAndUpdate(branchProductId, validatedBody, { new: true });
    //         if (!removeLanguage) {
    //             updatedCategory = BranchProduct.schema.methods.toJSONLocalizedOnly(updatedCategory, i18n.getLocale());
    //         }
    //         res.status(200).send(updatedCategory);
    //     }
    //     catch (err) {
    //         next(err);
    //     }
    // },

    async delete(req, res, next) {
        try {
            let user = req.user;

            let { branchProductId } = req.params;
            let product = await checkExistThenGet(branchProductId, BranchProduct, { deleted: false, branch: user.id });
            product.deleted = true;
            await product.save();
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
            
            let validatedBody = checkValidations(req);
            await BranchProduct.updateMany({  branch: user.id , _id: { $in: validatedBody.ids }, deleted: false }, { deleted: true, deletedDate: new Date() })
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    },
};