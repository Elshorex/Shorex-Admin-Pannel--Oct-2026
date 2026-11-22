import Promotion from "../../models/promotion.model/promotion.model.js";
import Country from "../../models/country.model/country.model.js";
import Status from "../../models/status.model/status.model.js";

import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import dotObject from 'dot-object';
import config from "../../config.js";
let populateQuery = [
    { path: 'status', model: 'status' },
    { path: 'country', model: 'country',populate:[{ path: 'defaultLanguage', model: 'language' }] },
];



export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [


                body('name').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('description').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('promotionFromDate').trim().optional(),
                body('promotionToDate').trim().optional(),
                body('media').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('mediaType').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isIn(['IMAGE','VIDEO']),
                body('country').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Country, { deleted: false });
                    return true;
                }),
                // body('status').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                //     .custom(async (val) => {
                //         await checkExist(val, Status, { deleted: false });
                //         return true;
                //     })
                body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') }) 
            ];
        }
        else {
            validations = [
                body('name').trim().optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('description').trim().optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('promotionFromDate').optional(),
                body('promotionToDate').optional(),
                body('media').trim().optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('mediaType').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isIn(['IMAGE','VIDEO']),
                body('country').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Country, { deleted: false });
                    return true;
                }),
                body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') })
                // body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                //     .custom(async (val) => {
                //         await checkExist(val, Status, { deleted: false });
                //         return true;
                //     })
            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { name,promotionFromDate,promotionToDate, country,all,removeLanguage} = req.query;
            let query = { deleted: false ,status:config.status.active};
            let sortQuery = { _id: -1 };

            checkDateFilter(req,query,sortQuery,true);
                
            if (country) query.country = country;
            if (name) {
                query.$or = [
                    {name : { '$regex': name, '$options': 'i' }},
                    {description : { '$regex': name, '$options': 'i' }}
                ]
            } 
            

            let count = await Promotion.countDocuments(query);
            let pageCount = count;
            let promotions;
            if (all) {
                pageCount=1;
                limit = count;
                promotions = await Promotion.find(query).sort(sortQuery)
                    .populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                promotions = await Promotion.find(query).sort(sortQuery)
                .limit(limit).skip((page - 1) * limit)
                    .populate(populateQuery);
            }

            if (!removeLanguage) {
                promotions = Promotion.schema.methods.toJSONLocalizedOnly(promotions, i18n.getLocale());
            }
            
            res.send(new ApiResponse(promotions, page, pageCount, limit, count, req));

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

            
            if (validatedBody.promotionFromDate == "") {
                delete validatedBody.promotionFromDate;
                delete validatedBody.promotionToDate;
            }
            console.log(validatedBody);

            let promotion = await Promotion.create(validatedBody);
            promotion = await Promotion.populate(promotion, populateQuery);
            promotion = Promotion.schema.methods.toJSONLocalizedOnly(promotion, i18n.getLocale());
            res.status(200).send(promotion);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { promotionId } = req.params;
            let { removeLanguage } = req.query;            
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            await checkExist(promotionId, Promotion, { deleted: false });
            let validatedBody = checkValidations(req);
            // validatedBody = dotObject.dot(validatedBody);

            if (validatedBody.promotionFromDate == "") {
                delete validatedBody.promotionFromDate
                delete validatedBody.promotionToDate
                validatedBody.$unset = {promotionFromDate:1,promotionToDate:1}
            }
            let updatedPromotion = await Promotion.findByIdAndUpdate(promotionId, validatedBody, { new: true });
            if(! removeLanguage) 
                updatedPromotion = Promotion.schema.methods.toJSONLocalizedOnly(updatedPromotion, i18n.getLocale());
            res.status(200).send({promotion:updatedPromotion});
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { promotionId } = req.params;
            let { removeLanguage } = req.query;
            let promotion = await checkExistThenGet(promotionId, Promotion, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                promotion = Promotion.schema.methods.toJSONLocalizedOnly(promotion, i18n.getLocale());
            }
            res.status(200).send(promotion);

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
            let { promotionId } = req.params;
            let promotion = await checkExistThenGet(promotionId, Promotion, { deleted: false });
            
            promotion.status = config.status.inactive;
            await promotion.save();
            res.status(200).send("Deleted Successfully");

        }
        catch (err) {
            next(err);
        }
    }
}