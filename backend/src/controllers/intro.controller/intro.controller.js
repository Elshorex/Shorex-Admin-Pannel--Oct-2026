import Intro from "../../models/intro.model/intro.model.js";
import ApiResponse from "../../helpers/ApiResponse.js";
import { checkExistThenGet, checkExist } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations,fieldhandleImg } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import moment from 'moment';
import dotObject from 'dot-object'



export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
                body('title').not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('title.ar').not().isEmpty().withMessage(() => { return i18n.__('arTitleRequired') }),
                body('title.en').optional().not().isEmpty().withMessage(() => { return i18n.__('enTitleRequired') }),

                body('text').not().isEmpty().withMessage(() => { return i18n.__('textRequired') }),
                body('text.ar').not().isEmpty().withMessage(() => { return i18n.__('arTextRequired') }),
                body('text.en').optional().not().isEmpty().withMessage(() => { return i18n.__('enTextRequired') })

            ];
        }
        else {
            validations = [
                body('title').optional().not().isEmpty().withMessage(() => { return i18n.__('titleRequired') }),
                body('title.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('arTitleRequired') }),
                body('title.en').optional().not().isEmpty().withMessage(() => { return i18n.__('enTitleRequired') }),

                body('text').optional().not().isEmpty().withMessage(() => { return i18n.__('textRequired') }),
                body('text.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('arTextRequired') }),
                body('text.en').optional().not().isEmpty().withMessage(() => { return i18n.__('enTextRequired') })

            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;

            var {  month, year  ,title , text ,all,removeLanguage} = req.query;
            let query = { deleted: false };

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

            let introes , introCount ;
            // if (all) {
                introes = await Intro.find(query).sort({ createdAt: -1 })
                introCount = introes.length;
            // }else{
            //     introes = await Intro.find(query).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit)
            //     introCount = await Intro.count(query);
            // }
             
            let pageCount = Math.ceil(introCount / limit);

            if (!removeLanguage) {
                introes = Intro.schema.methods.toJSONLocalizedOnly(introes, i18n.getLocale());
            }

            res.send(new ApiResponse(introes, page, pageCount, limit, introCount, req));

        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            let validatedBody = checkValidations(req);

            if (req.files && req.files['image'] && (req.files['image'].length > 0)) {
                let image = fieldhandleImg(req, { attributeName: 'image' });
                validatedBody.image = image;
            }
            
            // if (req.files && req.files['imageContent'] && req.files['imageContent'].length > 0) {
            //     let imageContent = fieldhandleImg(req, { attributeName: 'imageContent' });
            //     validatedBody.imageContent = imageContent;
            // }
            
            // if (req.files && req.files['videoContent'] && req.files['videoContent'].length > 0) {
            //     let videoContent = fieldhandleImg(req, { attributeName: 'videoContent' });
            //     validatedBody.videoContent = videoContent;
            // }
            

            
            let intro = await Intro.create(validatedBody);
            intro = intro.schema.methods.toJSONLocalizedOnly(intro, i18n.getLocale());
            res.status(200).send(intro);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { introId } = req.params;
            await checkExist(introId, Intro, { deleted: false });
            let validatedBody = checkValidations(req);


            if (req.files && req.files['image'] && (req.files['image'].length > 0)) {
                let image = fieldhandleImg(req, { attributeName: 'image' });
                validatedBody.image = image[0];
            }
            
            // if (req.files && req.files['imageContent'] && req.files['imageContent'].length > 0) {
            //     let imageContent = fieldhandleImg(req, { attributeName: 'imageContent' });
            //     validatedBody.imageContent = imageContent;
            // }
            
            // if (req.files && req.files['videoContent'] && req.files['videoContent'].length > 0) {
            //     let videoContent = fieldhandleImg(req, { attributeName: 'videoContent' });
            //     validatedBody.videoContent = videoContent;
            // }

            validatedBody = dotObject.dot(validatedBody);


            let updatedintro = await Intro.findByIdAndUpdate(introId, validatedBody, { new: true });
            updatedintro = Intro.schema.methods.toJSONLocalizedOnly(updatedintro, i18n.getLocale());
            res.status(200).send(updatedintro);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            var {  removeLanguage} = req.query;

            let { introId } = req.params;
            let intro = await checkExistThenGet(introId, Intro, { deleted: false });

            if(!removeLanguage){
                intro = Intro.schema.methods.toJSONLocalizedOnly(intro, i18n.getLocale());
            }
            res.status(200).send({intro});
        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let { introId } = req.params;
            let intro = await checkExistThenGet(introId, Intro, { deleted: false });
            intro.deleted = true;
            await intro.save();
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    }

    
}