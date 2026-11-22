import Contactus from "../../models/contact-us.model/contact-us.model.js";
import Country from "../../models/country.model/country.model.js";
import Status from "../../models/status.model/status.model.js";

import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
// import dotObject from 'dot-object';
let populateQuery = [
    { path: 'status', model: 'status' },
    { path: 'country', model: 'country' },
];



export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
                body('email').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isEmail().withMessage(() => { return i18n.__('invalidData') }),
                body('whatsapp').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('phoneNumber').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('telegram').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('location').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('country').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
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
                body('email').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isEmail().withMessage(() => { return i18n.__('invalidData') }),
                body('whatsapp').optional(),
                body('phoneNumber').optional(),
                body('telegram').optional(),
                body('location').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('country').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Country, { deleted: false });
                    return true;
                }),
                // body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                //     .custom(async (val) => {
                //         await checkExist(val, Status, { deleted: false });
                //         return true;
                //     })
                 body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') })
            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { name, country,all,removeLanguage} = req.query;
            let query = { deleted: false };
            let sortQuery = { _id: -1 };

            checkDateFilter(req,query,)
                
            if (country) query.country = country;
            if (name) query.name = { $regex: name, $options: "i" };

            let count = await Contactus.countDocuments(query);
            let pageCount = count;
            let contacts;
            if (all) {
                pageCount=1;
                limit = count;
                contacts = await Contactus.find(query).sort(sortQuery)
                    .populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                contacts = await Contactus.find(query).sort(sortQuery)
                .limit(limit).skip((page - 1) * limit)
                    .populate(populateQuery);
            }

            if (!removeLanguage) {
                contacts = Contactus.schema.methods.toJSONLocalizedOnly(contacts, i18n.getLocale());
            }
            
            res.send(new ApiResponse(contacts, page, pageCount, limit, count, req));

        } catch (err) {
            next(err);
        }
    },
        async create(req, res, next) {
            try {
                let user = req.user;
                // if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                //     return next(new ApiError(403, i18n.__('admin.auth')));
                // }
                let validatedBody = checkValidations(req);
                let contactus = await Contactus.create(validatedBody);

                // Removed updateMany to allow multiple records

                contactus = await Contactus.populate(contactus, populateQuery);
                contactus = Contactus.schema.methods.toJSONLocalizedOnly(contactus, i18n.getLocale());
                res.status(200).send(contactus);
            } catch (err) {
                next(err);
            }
        },

   async update(req, res, next) {
        try {
            let user = req.user;
            if (user.type !== "ADMIN" && user.type !== "SUB_ADMIN") {
                return next(new ApiError(403, i18n.__("admin.auth")));
            }

            let validatedBody = checkValidations(req);

            // Find the record by ID from params
            let { contactusId } = req.params;
            let contactus = await checkExistThenGet(contactusId, Contactus, { deleted: false });

            // Update only this record
            contactus = await Contactus.findByIdAndUpdate(contactus._id, validatedBody, { new: true });

            // Populate + localize
            contactus = await Contactus.populate(contactus, populateQuery);
            contactus = Contactus.schema.methods.toJSONLocalizedOnly(contactus, i18n.getLocale());

            res.status(200).send(contactus);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { contactusId } = req.params;
            let { removeLanguage } = req.query;
            let contactus = await checkExistThenGet(contactusId, Contactus, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                contactus = Contactus.schema.methods.toJSONLocalizedOnly(contactus, i18n.getLocale());
            }
            res.status(200).send(contactus);

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
            let { contactusId } = req.params;
            let contactus = await checkExistThenGet(contactusId, Contactus, { deleted: false });
            
            contactus.deleted = true;
            await contactus.save();
            res.status(200).send("Deleted Successfully");

        }
        catch (err) {
            next(err);
        }
    }
}