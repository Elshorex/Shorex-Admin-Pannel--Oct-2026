import Reasone from "../../models/reasone.model/reasone.model.js";
import ApiResponse from "../../helpers/ApiResponse.js";
import { checkExistThenGet, checkExist } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import moment from 'moment'
import dotObject from 'dot-object'

export default {

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { month,
                year, fromDate, toDate,type,
                title, _id, all, text, removeLanguage
            } = req.query;
            let query = { deleted: false };
            let date = new Date();

            if (type) {
                query.type = type;
            }
            if (title) {
                query.$or = [{ 'title.en': { '$regex': title, '$options': 'i' } }, { 'title.ar': { '$regex': title, '$options': 'i' } }]
            }
            if (text) {
                query.$or = [{ 'text.en': { '$regex': text, '$options': 'i' } }, { 'text.ar': { '$regex': text, '$options': 'i' } }]
            }


            if (_id) query._id = _id;
            if (fromDate && !toDate) query.createdAt = { $gte: new Date(moment(fromDate).startOf('day')) };
            if (toDate && !fromDate) query.createdAt = { $lt: new Date(moment(toDate).endOf('day')) };
            if (fromDate && toDate) query.createdAt = { $gte: new Date(moment(fromDate).startOf('day')), $lt: new Date(moment(toDate).endOf('day')) };
            if (month && year) {
                date = new Date();
                month = month - 1;
                date.setMonth(month);
                date.setFullYear(year);
                let startOfDate = new Date(moment(date).startOf('month'));
                let endOfDate = new Date(moment(date).endOf('month'));
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            else if (year && !month) {
                date.setFullYear(year);
                let startOfDate = new Date(moment(date).startOf('year'));
                let endOfDate = new Date(moment(date).endOf('year'));
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            let reasones, reasonesCount, pageCount;
            if (all) {
                reasones = await Reasone.find(query).sort({ _id: 1 }).limit(limit).skip((page - 1) * limit);
                reasonesCount = reasones.length;
                pageCount = 1
            } else {
                reasones = await Reasone.find(query).sort({ _id: 1 }).limit(limit).skip((page - 1) * limit);
                reasonesCount = await Reasone.count(query);
                pageCount = Math.ceil(reasonesCount / limit);
            }
            if (!removeLanguage)
                reasones = Reasone.schema.methods.toJSONLocalizedOnly(reasones, i18n.getLocale());
            res.send(new ApiResponse(reasones, page, pageCount, limit, reasonesCount, req));

        } catch (err) {
            next(err);
        }
    },

    validateBody(isUpdate) {
        let validate;
        if (!isUpdate) {
            validate = [
                body('title').not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('title.en').not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('title.ar').not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
           
                body('type').not().isEmpty().withMessage(() => { return i18n.__('typeRequired') })
                .isIn(['ALL','CLIENT','STORE','DRIVER']).withMessage(() => { return i18n.__('invalidType') }),
                body('text').not().isEmpty().withMessage(() => { return i18n.__('textRequired') }),
                body('text.en').not().isEmpty().withMessage(() => { return i18n.__('textRequired') }),
                body('text.ar').not().isEmpty().withMessage(() => { return i18n.__('textRequired') })
            ];
        } else {
            validate = [
                body('title').optional().not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('title.en').optional().not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('title.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
           
                body('type').optional().not().isEmpty().withMessage(() => { return i18n.__('typeRequired') })
                .isIn(['ALL','CLIENT','STORE','DRIVER']).withMessage(() => { return i18n.__('invalidType') }),
                body('text').optional().not().isEmpty().withMessage(() => { return i18n.__('textRequired') }),
                body('text.en').optional().not().isEmpty().withMessage(() => { return i18n.__('textRequired') }),
                body('text.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('textRequired') })
            ];
        }
        return validate;
    },

    async create(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            let reasone = await Reasone.create(validatedBody);
            res.status(200).send(reasone);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { reasoneId } = req.params;
            await checkExist(reasoneId, Reasone, { deleted: false });
            let validatedBody = checkValidations(req);
            validatedBody = dotObject.dot(validatedBody);

            let updatedreasone = await Reasone.findByIdAndUpdate(reasoneId, validatedBody, { new: true })
            res.status(200).send(updatedreasone);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { reasoneId } = req.params;
            let { removeLanguage } = req.query;
            let reasone = await checkExistThenGet(reasoneId, Reasone, { deleted: false });
            if (!removeLanguage) {
                reasone = Reasone.schema.methods.toJSONLocalizedOnly(reasone, i18n.getLocale());
            }
            res.status(200).send(reasone);
        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let { reasoneId } = req.params;
            let reasone = await checkExistThenGet(reasoneId, Reasone, { deleted: false });
            reasone.deleted = true;
            await reasone.save();
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    },

    async likeReasone(req, res, next){
        try {
            let { reasoneId } = req.params;
            let reasone = await checkExistThenGet(reasoneId, Reasone, { deleted: false });
            reasone.likedCount = reasone.likedCount +1;
            await reasone.save();
            res.status(200).send({reasone});
        } catch (error) {
            next(err);
        }
    },

    async disLikeReasone(req, res, next){
        try {
            let { reasoneId } = req.params;
            let reasone = await checkExistThenGet(reasoneId, Reasone, { deleted: false });
            reasone.disLikedCount = reasone.disLikedCount +1;
            await reasone.save();
            res.status(200).send({reasone});
        } catch (error) {
            next(err);
        }
    }
}