import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExist, checkExistThenGet ,checkDateFilter} from "../../helpers/CheckMethods.js";
import { checkValidations } from "../shared.controller/shared.controller.js";
import { body } from "express-validator";
import AdminSiteMap from "../../models/admin-site-map.model/admin-site-map.model.js";
import Status from "../../models/status.model/status.model.js";
import i18n from 'i18n'
import dotObject from 'dot-object';

let populateQuery = [{ path: 'status', model: 'status' }];


export default {

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {  all, removeLanguage } = req.query;
            let query = { deleted: false };
            let sortQuery = { createdAt: -1 };

            checkDateFilter(req,query,sortQuery);
            
            const count = await AdminSiteMap.count(query);
            let adminSiteMaps;
            let pageCount = count;
            if (all) {
                limit = pageCount;
                adminSiteMaps = await AdminSiteMap.find(query).sort({ createdAt: -1 }).populate(populateQuery)
            }
            else {
                pageCount = Math.ceil(count / limit);
                adminSiteMaps = await AdminSiteMap.find(query).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).populate(populateQuery)
            }
            if (!removeLanguage) {
                adminSiteMaps = AdminSiteMap.schema.methods.toJSONLocalizedOnly(adminSiteMaps, i18n.getLocale());
            }

            res.send(new ApiResponse(adminSiteMaps, page, pageCount, limit, count, req));
        } catch (err) {
            next(err);
        }
    },

    validateBody(isUpdate = false) {
        let validations = [];
        if (!isUpdate) {
            validations = [
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.en': val, deleted: false };
                        let adminSiteMap = await AdminSiteMap.findOne(query).lean();
                        if (adminSiteMap)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.ar').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.ar': val, deleted: false };
                        let adminSiteMap = await AdminSiteMap.findOne(query).lean();
                        if (adminSiteMap)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('name.es').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.es': val, deleted: false };
                        let adminSiteMap = await AdminSiteMap.findOne(query).lean();
                        if (adminSiteMap)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('parent').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, AdminSiteMap, { deleted: false });
                        return true;
                    }),
                body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Status, { deleted: false });
                        return true;
                    })
            ];
        }
        else {
            validations = [
                
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.en': val, deleted: false };
                        if (isUpdate)
                            query._id = { $ne: req.params.adminSiteMapId };
                        let adminSiteMap = await AdminSiteMap.findOne(query).lean();
                        if (adminSiteMap)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.ar': val, deleted: false };
                        if (isUpdate)
                            query._id = { $ne: req.params.adminSiteMapId };
                        let adminSiteMap = await AdminSiteMap.findOne(query).lean();
                        if (adminSiteMap)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('name.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.es': val, deleted: false };
                        if (isUpdate)
                            query._id = { $ne: req.params.adminSiteMapId };
                        let adminSiteMap = await AdminSiteMap.findOne(query).lean();
                        if (adminSiteMap)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('parent').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, AdminSiteMap, { deleted: false });
                        return true;
                    }),
                body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, Status, { deleted: false });
                        return true;
                    })
            ];
        }
        return validations;
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            if (! ['ADMIN','SUB_ADMIN'].includes(user.type) )
                return next(new ApiError(403, i18n.__('unauthrized')));
            let validatedBody = checkValidations(req);
            
            let createdItem = await AdminSiteMap.create(validatedBody);
            createdItem = AdminSiteMap.schema.methods.toJSONLocalizedOnly(createdItem, i18n.getLocale());
            res.status(200).send(createdItem);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { adminSiteMapId } = req.params;
            let { removeLanguage } = req.query;
            let adminSiteMap = await checkExistThenGet(adminSiteMapId, AdminSiteMap, { deleted: false ,populate:populateQuery});
            if (!removeLanguage) {
                adminSiteMap = AdminSiteMap.schema.methods.toJSONLocalizedOnly(adminSiteMap, i18n.getLocale());
            }
            res.status(200).send(adminSiteMap);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let user = req.user;
            if (! ['ADMIN','SUB_ADMIN'].includes(user.type) )
                return next(new ApiError(403, i18n.__('unauthrized')));

            let { adminSiteMapId } = req.params;
            let { removeLanguage } = req.query;
            let adminSiteMap = await checkExistThenGet(adminSiteMapId, AdminSiteMap, { deleted: false });
            let validatedBody = checkValidations(req);
            
            validatedBody = dotObject.dot(validatedBody);
           
            

            let updatedCategory = await AdminSiteMap.findByIdAndUpdate(adminSiteMapId, validatedBody, { new: true }).populate(populateQuery);
            if (!removeLanguage) {
                updatedCategory = AdminSiteMap.schema.methods.toJSONLocalizedOnly(updatedCategory, i18n.getLocale());
            }
            res.status(200).send(updatedCategory);
        }
        catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user;
            if (! ['ADMIN','SUB_ADMIN'].includes(user.type) )
                return next(new ApiError(403, i18n.__('unauthrized')));

            let { adminSiteMapId } = req.params;
            let adminSiteMap = await checkExistThenGet(adminSiteMapId, AdminSiteMap, { deleted: false });
            
            let parent = await AdminSiteMap.findOne({deleted:false,parent:adminSiteMapId});
            if (parent) {
                return next(new ApiError(400, i18n.__('parentExist')));
                
            }
            
            adminSiteMap.deleted = true;
            await adminSiteMap.save();
            res.status(200).send('Deleted Successfully');
        }
        catch (err) {
            next(err);
        }
    },

    validateDeleteMulti() {
        return [
            body('ids').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).isArray().withMessage('must be array'),
        ];
    },

    async deleteMuti(req, res, next) {
        try {
            let user = req.user;
            if (! ['ADMIN','SUB_ADMIN'].includes(user.type) )
                return next(new ApiError(403, i18n.__('unauthrized')));

            let validatedBody = checkValidations(req);
            await AdminSiteMap.updateMany({ _id: { $in: validatedBody.ids }, deleted: false }, { deleted: true, deletedDate: new Date() })
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    }
};