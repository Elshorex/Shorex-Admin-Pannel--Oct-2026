import Point from "../../models/reward-points.model/reward-points.model.js";
import Country from "../../models/country.model/country.model.js";
import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import dotObject from 'dot-object'


let populateQuery = [{ path: 'country', model: 'country',populate:[{ path: 'currency', model: 'currency' }] }];


export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
                
                body('point').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('amount').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('country').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Country, { deleted: false });
                        return true;
                    })
            ];
        }
        else {
            validations = [
                body('point').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('amount').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
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
            let { removeLanguage, all ,name} = req.query;
            let query = { deleted: false };
            let sortQuery = { createdAt: -1 }
            checkDateFilter(req, query, sortQuery,true);

            if (name) {
                let cities = await Country.find({deleted:false,$or : [
                    { 'name.en': { '$regex': name, '$options': 'i' } },
                    { 'name.ar': { '$regex': name, '$options': 'i' } },
                    { 'name.es': { '$regex': name, '$options': 'i' } }
                ]}).distinct('_id');
                query.country = {$in:cities};
            }

            let points;

            let count = await Point.countDocuments(query);
            let pageCount = count;
            if (all) {
                pageCount = 1;
                limit = count;
                points = await Point.find(query).sort(sortQuery).populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                points = await Point.find(query).sort(sortQuery).limit(limit).skip((page - 1) * limit).populate(populateQuery)
            }

            if (!removeLanguage) {
                points = Point.schema.methods.toJSONLocalizedOnly(points, i18n.getLocale());
            }
            res.send(new ApiResponse(points, page, pageCount, limit, count, req));


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
            
            let point = await Point.create(validatedBody);
            point = Point.schema.methods.toJSONLocalizedOnly(point, i18n.getLocale());
            res.status(200).send(point);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { pointId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            await checkExist(pointId, Point, { deleted: false });
            let validatedBody = checkValidations(req);
            let data = {};
            
            validatedBody = dotObject.dot(validatedBody);
            let updatedProduct = await Point.findByIdAndUpdate(pointId, {  ...validatedBody, ...data }, { new: true });
            if (!removeLanguage)
                updatedProduct = Point.schema.methods.toJSONLocalizedOnly(updatedProduct, i18n.getLocale());
            res.status(200).send(updatedProduct);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { pointId } = req.params;
            let { removeLanguage } = req.query;
            let point = await checkExistThenGet(pointId, Point, { deleted: false ,populate:populateQuery});
            if (!removeLanguage) {
                point = Point.schema.methods.toJSONLocalizedOnly(point, i18n.getLocale());
            }
            res.status(200).send(point);

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
            let { pointId } = req.params;
            let point = await checkExistThenGet(pointId, Point, { deleted: false });
            
            point.deleted = true;
            await point.save();
            res.status(200).send("Deleted Successfully");
            
        }
        catch (err) {
            next(err);
        }
    }
}