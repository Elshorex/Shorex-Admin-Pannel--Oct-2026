import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExist, checkExistThenGet ,checkDateFilter} from "../../helpers/CheckMethods.js";
import { checkValidations } from "../shared.controller/shared.controller.js";
import { body } from "express-validator";
import UserRole from "../../models/user-roles.model/user-roles.model.js";
import AdminSiteMap from "../../models/admin-site-map.model/admin-site-map.model.js";
import Status from "../../models/status.model/status.model.js";
import i18n from 'i18n'
import dotObject from 'dot-object';

let populateQuery = [{ path: 'status', model: 'status' },{path: 'sitePages', model: 'adminSiteMap'}];


export default {

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {  all, removeLanguage } = req.query;
            let query = { deleted: false };
            let sortQuery = { createdAt: -1 };

            checkDateFilter(req,query,sortQuery);
            
            const count = await UserRole.count(query);
            let adminSiteMaps;
            let pageCount = count;
            if (all) {
                limit = pageCount;
                adminSiteMaps = await UserRole.find(query).sort(sortQuery).populate(populateQuery)
            }
            else {
                pageCount = Math.ceil(count / limit);
                adminSiteMaps = await UserRole.find(query).sort(sortQuery).limit(limit).skip((page - 1) * limit).populate(populateQuery)
            }
            if (!removeLanguage) {
                adminSiteMaps = UserRole.schema.methods.toJSONLocalizedOnly(adminSiteMaps, i18n.getLocale());
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
                body('sitePages').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('type').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isIn(['ADMIN','SUB_ADMIN','CLIENT','PROVIDER','STORE_KEEPER','DRIVER']),
                body('name.en').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.en': val, deleted: false };
                        let userRole = await UserRole.findOne(query).lean();
                        if (userRole)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.ar').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.ar': val, deleted: false };
                        let userRole = await UserRole.findOne(query).lean();
                        if (userRole)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('name.es').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.es': val, deleted: false };
                        let userRole = await UserRole.findOne(query).lean();
                        if (userRole)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('parent').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, UserRole, { deleted: false });
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
                body('sitePages').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('type').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isIn(['ADMIN','SUB_ADMIN','CLIENT','PROVIDER']),
                
                body('name.en').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.en': val, deleted: false };
                        if (isUpdate)
                            query._id = { $ne: req.params.userRoleId };
                        let userRole = await UserRole.findOne(query).lean();
                        if (userRole)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.ar').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.ar': val, deleted: false };
                        if (isUpdate)
                            query._id = { $ne: req.params.userRoleId };
                        let userRole = await UserRole.findOne(query).lean();
                        if (userRole)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('name.es').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.es': val, deleted: false };
                        if (isUpdate)
                            query._id = { $ne: req.params.userRoleId };
                        let userRole = await UserRole.findOne(query).lean();
                        if (userRole)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('parent').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val) => {
                        await checkExist(val, UserRole, { deleted: false });
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
                return next(new ApiError(403, i18n.__('admin.auth')));
            let validatedBody = checkValidations(req);

            if (validatedBody.sitePages) {
                let sitePages = await AdminSiteMap.find({deleted:false,_id:{$in:validatedBody.sitePages}});
                if (validatedBody.sitePages.length != sitePages.length) {
                    return next(new ApiError(403, i18n.__('notFound')));
                    
                }
            }
            
            let createdItem = await UserRole.create(validatedBody);
            createdItem = UserRole.schema.methods.toJSONLocalizedOnly(createdItem, i18n.getLocale());
            res.status(200).send(createdItem);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { userRoleId } = req.params;
            let { removeLanguage } = req.query;
            let userRole = await checkExistThenGet(userRoleId, UserRole, { deleted: false,populate:populateQuery });
            if (!removeLanguage) {
                userRole = UserRole.schema.methods.toJSONLocalizedOnly(userRole, i18n.getLocale());
            }
            res.status(200).send(userRole);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let user = req.user;
            if (! ['ADMIN','SUB_ADMIN'].includes(user.type) )
                return next(new ApiError(403, i18n.__('admin.auth')));

            let { userRoleId } = req.params;
            let { removeLanguage } = req.query;
            let userRole = await checkExistThenGet(userRoleId, UserRole, { deleted: false });
            let validatedBody = checkValidations(req);
            
            validatedBody = dotObject.dot(validatedBody);

            if (validatedBody.sitePages) {
                let sitePages = await AdminSiteMap.find({deleted:false,_id:{$in:validatedBody.sitePages}});
                if (validatedBody.sitePages.length != sitePages.length) {
                    return next(new ApiError(403, i18n.__('notFound')));
                    
                }
            }
           
            

            let updatedCategory = await UserRole.findByIdAndUpdate(userRoleId, validatedBody, { new: true }).populate(populateQuery);
            if (!removeLanguage) {
                updatedCategory = UserRole.schema.methods.toJSONLocalizedOnly(updatedCategory, i18n.getLocale());
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
                return next(new ApiError(403, i18n.__('admin.auth')));

            let { userRoleId } = req.params;
            let userRole = await checkExistThenGet(userRoleId, UserRole, { deleted: false });
            let parent = await UserRole.findOne({deleted:false,parent:userRoleId});
            if (parent) {
                return next(new ApiError(400, i18n.__('relationExist')));
            }
            userRole.deleted = true;
            await userRole.save();
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

            let parent = await UserRole.findOne({deleted:false,parent:{$in:validatedBody.ids}});
            if (parent) {
                return next(new ApiError(400, i18n.__('relationExist')));
            }

            await UserRole.updateMany({ _id: { $in: validatedBody.ids }, deleted: false }, { deleted: true, deletedDate: new Date() })
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    }
};