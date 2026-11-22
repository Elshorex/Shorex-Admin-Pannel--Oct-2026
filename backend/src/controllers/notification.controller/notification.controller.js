import Notification from "../../models/notif.model/notif.model.js";
import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import config from "../../config.js";
import i18n from 'i18n';
import dotObject from 'dot-object'


let populateQuery = [];


export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
                body('notificationType').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isIn(['GROUP','SINGLE_USER']).withMessage(() => { return i18n.__('invalidData') }),
                body('image').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('title.ar').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('title.en').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('title.es').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                
                body('description.ar').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('description.en').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('description.es').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                
                body('userType').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isIn(['ALL',...config.types ]),
                
                body('users')
                .optional({ nullable: true })   // <-- allows null
                .isArray().withMessage(() => i18n.__('filedRequired')),

                body('sendDate').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                
            ];
        }
        else {
            validations = [
                body('notificationType').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isIn(['GROUP','SINGLE_USER']).withMessage(() => { return i18n.__('invalidData') }),
                body('image').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('title.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('title.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('title.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                
                body('description.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('description.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('description.es').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                
                body('userType').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .isIn(['ALL',...config.types ]),
                
                body('users').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).isArray(),
                body('readBy').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).isArray(),

                body('sendDate').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                
            ];

        }
        return validations;
    },

async findAll(req, res, next) {
    try {
        // ---------------------
        // Pagination
        // ---------------------
        let page = +req.query.page || 1;
        let limit = +req.query.limit || 20;

        // ---------------------
        // Query params
        // ---------------------
        let { removeLanguage, all, userType, notificationType, user, name } = req.query;

        // ---------------------
        // Base query
        // ---------------------
        let query = { deleted: false };
        let sortQuery = { createdAt: -1 };

        checkDateFilter(req, query, sortQuery, true);

        // ---------------------
        // Optional filters
        // ---------------------
        if (userType) query.userType = userType;
        if (notificationType) query.notificationType = notificationType;

        // Filter by a specific user (Admin use case)
        if (user) {
            if (mongoose.Types.ObjectId.isValid(user)) {
                query.users = { $in: [mongoose.Types.ObjectId(user)] };
            } else {
                return res.status(400).send({ message: "Invalid user ID" });
            }
        }

        // Filter by name search
        if (name) {
            const regex = { $regex: name, $options: "i" };
            query.$or = [
                { "title.en": regex },
                { "title.ar": regex },
                { "title.es": regex },
                { "description.en": regex },
                { "description.ar": regex },
                { "description.es": regex }
            ];
        }

        // ---------------------
        // ROLE-BASED ACCESS CONTROL
        // ---------------------
        const requester = req.user;
        const fullAccessTypes = ["ADMIN", "PROVIDER"];

        if (!fullAccessTypes.includes(requester.type)) {
            const userId = Number(requester._id);

            query.$or = [
                // Group notification: userType matches AND users array empty
                {
                    notificationType: "GROUP",
                    userType: requester.type,
                    $or: [
                        { users: { $exists: false } },
                        { users: { $size: 0 } }
                    ]
                },
                // Single user notification: users contains the logged-in user
                {
                    notificationType: "SINGLE_USER",
                    users: userId
                }
            ];
        }

        // ---------------------
        // Fetch notifications
        // ---------------------
        const count = await Notification.countDocuments(query);

        let notifications;
        if (all) {
            notifications = await Notification.find(query)
                .sort(sortQuery)
                .populate(populateQuery);
        } else {
            notifications = await Notification.find(query)
                .sort(sortQuery)
                .limit(limit)
                .skip((page - 1) * limit)
                .populate(populateQuery);
        }

        // ---------------------
        // Localization
        // ---------------------
        if (!removeLanguage) {
            notifications = Notification.schema.methods.toJSONLocalizedOnly(
                notifications,
                i18n.getLocale()
            );
        }

        // ---------------------
        // Unread count (only for roles that need it)
        // ---------------------
        let unreadCount = 0;
        const allowedUserTypes = ["CLIENT", "DRIVER", "STOREKEEPER"];

        if (req.user && allowedUserTypes.includes(req.user.type)) {
            unreadCount = await Notification.countDocuments({
                deleted: false,
                readBy: { $ne: req.user._id },
                $or: [
                    { userType: req.user.type },
                    { users: { $in: [req.user._id] } }
                ]
            });
        }

        // ---------------------
        // Response
        // ---------------------
        res.send(
            new ApiResponse(
                notifications,                 // data
                page,
                Math.ceil(count / limit),
                limit,
                count,
                req,
                { unreadCount }                // extra metadata
            )
        );

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
            
            let notification = await Notification.create(validatedBody);
            notification = Notification.schema.methods.toJSONLocalizedOnly(notification, i18n.getLocale());
            res.status(200).send(notification);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { notificationId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;
            // if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
            //     return next(new ApiError(403, i18n.__('admin.auth')));
            // }
            await checkExist(notificationId, Notification, { deleted: false });
            let validatedBody = checkValidations(req);
            let data = {};
            if (validatedBody.users) {
                data.users = validatedBody.users;
                delete validatedBody.users;
            }
            validatedBody = dotObject.dot(validatedBody);
            let updatedCountry = await Notification.findByIdAndUpdate(notificationId, {...validatedBody,...data}, { new: true });
            if (!removeLanguage)
                updatedCountry = Notification.schema.methods.toJSONLocalizedOnly(updatedCountry, i18n.getLocale());
            res.status(200).send(updatedCountry);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { notificationId } = req.params;
            let { removeLanguage } = req.query;
            let notification = await checkExistThenGet(notificationId, Notification, { deleted: false });
            if (!removeLanguage) {
                notification = Notification.schema.methods.toJSONLocalizedOnly(notification, i18n.getLocale());
            }
            res.status(200).send(notification);

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
            let { notificationId } = req.params;
            let notification = await checkExistThenGet(notificationId, Notification, { deleted: false });
            
            notification.deleted = true;
            await notification.save();
            res.status(200).send("Deleted Successfully");
            
        }
        catch (err) {
            next(err);
        }
    },
    async markAllAsRead(req, res, next) {
        try {
            const userId = req.user._id;

            await Notification.updateMany(
                { readBy: { $ne: userId }, deleted: false },
                { $push: { readBy: userId } }
            );

            res.status(200).send({ message: "All notifications marked as read" });
        } catch (err) {
            next(err);
        }
    }
}

