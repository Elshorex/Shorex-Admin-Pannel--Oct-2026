import Company from "../../models/company.model/company.model.js";
import { checkValidations } from "../shared.controller/shared.controller.js";
import { body } from "express-validator";
import i18n from 'i18n'
import dotObject from 'dot-object'
import socketEvents from '../../socketEvents.js'
import ApiError from "../../helpers/ApiError.js";

export default {

    validateBody() {
        let   validations = [
                body('socialLinks').optional().not().isEmpty().withMessage(() => { return i18n.__('socialLinksRequired') })
                    .isArray().withMessage(() => { return i18n.__('mustBeArray') }),
                body('socialLinks.*.key').not().isEmpty().withMessage(() => { return i18n.__('socialLinksRequired') }),
                body('socialLinks.*.value').not().isEmpty().withMessage(() => { return i18n.__('socialLinksRequired') }),
                
                body('numberPerPage').optional().not().isEmpty().withMessage(() => { return i18n.__('numberPerPageRequired') }),
                body('name').optional().not().isEmpty().withMessage(() => { return i18n.__('nameRequired') }),
                body('logo').optional().not().isEmpty().withMessage(() => { return i18n.__('logoRequired') }),
                body('androidUrl').optional().not().isEmpty().withMessage(() => { return i18n.__('androidUrlRequired') }),
                body('iosUrl').optional().not().isEmpty().withMessage(() => { return i18n.__('iosUrlRequired') }),
                
                body('location.long').optional().not().isEmpty().withMessage(() => { return i18n.__('longitudeRequired') }),
                body('location.lat').optional().not().isEmpty().withMessage(() => { return i18n.__('latitudeRequired') }),
                body('location.address').optional().not().isEmpty().withMessage(() => { return i18n.__('addressRequired') }),
                
                body('appVersion').optional().not().isEmpty().withMessage(() => { return i18n.__('appVersionRequired') }),
                body('appVersion.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('arappVersionRequired') }),
                body('appVersion.en').optional().not().isEmpty().withMessage(() => { return i18n.__('enappVersionRequired') }),
                
                body('aboutUs').optional().not().isEmpty().withMessage(() => { return i18n.__('categoryRequired') }),
                body('aboutUs.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('arCategoryRequired') }),
                body('aboutUs.en').optional().not().isEmpty().withMessage(() => { return i18n.__('enCategoryRequired') }),

                body('email').optional().not().isEmpty().withMessage(() => { return i18n.__('emailRequired') }),
                body('phone').optional().not().isEmpty().withMessage(() => { return i18n.__('phonesRequired') }),
               
            ];
        return validations;
    },

    async create(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            await Company.updateMany({ deleted: false }, { deleted: true });
            let createdCompany = await Company.create(validatedBody);
            res.status(201).send(createdCompany);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { removeLanguage } = req.query;
            let company = await Company.findOne({deleted: false});
            if (!company) {
                return next(new ApiError(400, i18n.__('notExist')));

            }
            if (!removeLanguage) {
                company = Company.schema.methods.toJSONLocalizedOnly(company, i18n.getLocale());
            }
            res.send(company);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            
            let data = {}
            if (validatedBody.socialLinks) {
                data.socialLinks = validatedBody.socialLinks;
                delete validatedBody.socialLinks
            }


            validatedBody = dotObject.dot(validatedBody);

            let updatedCompany = await Company.findOneAndUpdate({deleted:false}, { ...validatedBody, ...data }, { new: true });
            res.status(200).send(updatedCompany);
            notificationNSP.emit(socketEvents.Company, { company: updatedCompany });
        }
        catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            

            await Company.updateMany({deleted:false},{deleted:true});
            res.status(200).send('delete success');
        }
        catch (err) {
            next(err);
        }
    }
};