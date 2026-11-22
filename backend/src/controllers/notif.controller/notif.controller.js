import User from "../../models/user.model/user.model.js";
import { checkExistThenGet, checkExist } from "../../helpers/CheckMethods.js";
import Notif from "../../models/notif.model/notif.model.js";
import ApiResponse from "../../helpers/ApiResponse.js";
import { sendPushNotification } from '../../services/push-notification-service.js'
import { checkValidations, handleImg } from '../shared.controller/shared.controller.js';
import { body } from 'express-validator';
import ApiError from "../../helpers/ApiError.js";
import i18n from 'i18n';
import socketEvents from '../../socketEvents.js';
import config from '../../config.js'
const populateQuery = [
    { path: 'resource', model: 'user' },
    { path: 'target', model: 'user' },
    { path: 'users', model: 'user' },
    { path: 'order', model: 'order', populate: [{ path: 'trader', model: 'user' }, { path: 'driver', model: 'user' }] },
    {
        path: 'promoCode', model: 'promocode',
        populate: [{ path: 'users', model: 'user' },
        { path: 'zones', model: 'zone' }, { path: 'institutions', model: 'user' },
        { path: 'categories', model: 'category' }, { path: 'products', model: 'product' }

        ]
    },

];

let create = async (resource, target, description, subject, subjectType, order, orderStatus) => {
    try {
        var query = { resource, description, subject, subjectType }
        if (target) {
            query.target = target;
        }
        if (orderStatus) {
            query.orderStatus = orderStatus;
        }
        if (subjectType == "PROMOCODE") query.promoCode = subject;
        if (subjectType == "ORDER") query.order = subject;
        if (subjectType == "CHANGE_ORDER_STATUS") query.order = subject;

        if (subject && subjectType) {
            query.subjectType = subjectType;
            query.subject = subject;
        }
        if (order) {
            query.order = order;
        }

        var newNotification = new Notif(query);
        await newNotification.save();

        if (target) {
            let counter = await Notif.countDocuments({ deleted: false, target: target, informed: { $ne: target } });
            notificationNSP.to('room-' + target).emit(socketEvents.NotificationsCount, { count: counter });
        }
    } catch (error) {
        console.log(error.message)
    }
}

export default {

    async findMyNotification(req, res, next) {
        try {
            let user = req.user._id;
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let query = {
                deleted: false,
                $or: [{ target: user }, { users: { $elemMatch: { $eq: user } } }, { type: 'ALL' }, { type: 'ALL', userType: req.user.type }],
                // type: { $nin: ['MAIL', 'SMS'] },
                createdAt: { $gte: req.user.createdAt },
                usersDeleted: { $ne: user }
            };
            if ((req.user.type == 'DRIVER') || (req.user.type == 'INSTITUTION')) {
                query.createdAt = { $gte: new Date(req.user.updatedStatusDate || req.user.createdAt) }
            }
            let { subjectType } = req.query
            if (subjectType) query = { subjectType: 'ADMIN', deleted: false, usersDeleted: { $ne: user } };

            var notifs = await Notif.find(query).populate(populateQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit);

            notifs = Notif.schema.methods.toJSONLocalizedOnly(notifs, i18n.getLocale());
            const notifsCount = await Notif.countDocuments(query);
            const pageCount = Math.ceil(notifsCount / limit);
            if (!subjectType) {
                // query = { $or: [{ target: user }, { users: user, type: 'USERS' }], informed: { $ne: user }, deleted: false, usersDeleted: { $ne: user } }

                await Notif.updateMany({ ...query, informed: { $ne: user } }, { $addToSet: { informed: user } });
                var toRoom = 'room-' + user;
                notificationNSP.to(toRoom).emit(socketEvents.NotificationsCount, { count: 0 });
            }

            res.send(new ApiResponse(notifs, page, pageCount, limit, notifsCount, req));
        } catch (err) {
            console.log(err);
            next(err);
        }
    },

    async read(req, res, next) {
        try {
            let { notifId } = req.params;
            let notif = await checkExistThenGet(notifId, Notif);
            notif.read = true;
            await notif.save();
            res.send('notif read');
        } catch (error) {
            next(error);
        }
    },

    async unread(req, res, next) {
        try {
            let { notifId } = req.params;
            let notif = await checkExistThenGet(notifId, Notif);
            notif.read = false;
            await notif.save();
            res.send('notif unread');
        } catch (error) {
            next(error);
        }
    },

    async getCountNotification(user, admin = false) {
        try {
            var toRoom = 'room-' + user.id;
            var query = {
                deleted: false,
                $or: [{ target: user.id }, { users: { $elemMatch: { $eq: user.id } } }, { type: 'ALL', userType: [] }, { type: 'ALL', userType: user.type }],
                // type: { $nin: ['MAIL', 'SMS'] },
                informed: { $ne: user.id },
                createdAt: { $gte: user.createdAt },
                usersDeleted: { $ne: user.id }
            };
            if ((user.type == 'DRIVER') || (user.type == 'INSTITUTION')) {
                query.createdAt = { $gte: new Date(user.updatedStatusDate || user.createdAt) }
            }
            var notifsCount = await Notif.countDocuments(query);
            if (!admin) {
                notificationNSP.to(toRoom).emit(socketEvents.NotificationsCount, { count: notifsCount });
            }
            else {
                adminNSP.to('room-admin').emit(socketEvents.NotificationsCount, { count: notifsCount });
            }
        } catch (err) {
            console.log(err.message);
        }
    },

    async pushNotification(targetUser, subjectType, subjectId, text, targetUserData, image) {
        try {
            var user = targetUserData ? targetUserData : await checkExistThenGet(targetUser, User, { deleted: false });
            if (user.notification) {
                let notifTitle = config.notificationTitle;
                let data = { targetUser: user, subjectType: subjectType, subjectId: subjectId, text: text[user.language], title: notifTitle[user.language] }
                if (image) {
                    data.image = config.backend_endpoint + image;
                }
                sendPushNotification(data);
            } else {
                return true;
            }
        } catch (error) {
            console.log(error.message)
        }
    },

    validateAdminSendToAll() {
        let validations = [
            body('titleOfNotification.ar').not().isEmpty().withMessage(() => i18n.__('arabicTitleRequired')),
            body('titleOfNotification.en').not().isEmpty().withMessage(() => i18n.__('englishTitleRequired')),
            body('text.ar').not().isEmpty().withMessage(() => i18n.__('arabicTextRequired')),
            body('text.en').not().isEmpty().withMessage(() => i18n.__('englishTextRequired')),
            body('userType').optional().not().isEmpty().withMessage(() => i18n.__('userTypeRequired'))
                .isIn(['CLIENT', 'INSTITUTION', 'DRIVER'])
        ];
        return validations;
    },

    async adminSendToAllUsers(req, res, next) {
        try {
            let user = req.user;

            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, ('admin.auth')));
            }
            let validatedBody = checkValidations(req);
            let query = { deleted: false, type: { $nin: ['ADMIN', 'SUB_ADMIN'] } }
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'image', isUpdate: false });
                validatedBody.image = image;
            }
            let notifiObj = { titleOfNotification: validatedBody.titleOfNotification, resource: req.user.id, type: "ALL", subjectType: "ADMIN", description: validatedBody.text };
            // console.log(validatedBody);
            if (validatedBody.userType) {
                notifiObj.userType = validatedBody.userType;
                // console.log(notifiObj);
                query.type = validatedBody.userType //{ $in: validatedBody.userType }
            }
            if (validatedBody.image) notifiObj.image = validatedBody.image
            await Notif.create(notifiObj)

            query.$or = [{ type: 'CLIENT' }, { type: ['DRIVER', 'INSTITUTION'], status: 'ACCEPTED' }]
            var allUsers = await User.find(query);

            allUsers.forEach(async (user) => {
                if (user.notification) {
                    await sendPushNotification(
                        {
                            targetUser: user,
                            subjectType: "ADMIN",
                            subjectId: 1,
                            text: validatedBody.text[user.language],
                            title: validatedBody.titleOfNotification[user.language],
                            image: (validatedBody.image) ? config.backend_endpoint + validatedBody.image : ''
                        });
                }
                notificationNSP.to('room-' + user.id).emit(socketEvents.NotificationsCount, { count: await Notif.countDocuments({ $or: [{ target: user.id }, { users: user.id }], informed: { $ne: user.id }, deleted: false, usersDeleted: { $ne: user.id } }) });

            });
            res.status(200).send("Successfully send to all users");
        } catch (error) {
            next(error)
        }
    },

    validateAdminSendToSpecificUsers() {
        let validations = [
            body('userType').optional().not().isEmpty().withMessage(() => i18n.__('userTypeRequired'))
                .isIn(['CLIENT', 'INSTITUTION', 'DRIVER']),
            // body('userType.*').isIn(['CLIENT', 'INSTITUTION', 'DRIVER']),

            body('titleOfNotification.ar').not().isEmpty().withMessage(() => i18n.__('arabicTitleRequired')),
            body('titleOfNotification.en').not().isEmpty().withMessage(() => i18n.__('englishTitleRequired')),

            body('text.ar').not().isEmpty().withMessage(() => i18n.__('arabicTextRequired')),
            body('text.en').not().isEmpty().withMessage(() => i18n.__('englishTextRequired')),

            body('users').not().isEmpty().withMessage(() => i18n.__('userRequired'))
                .isArray().withMessage(() => i18n.__('muntBeArray'))
                .custom(async (val, { req }) => {
                    for (let index = 0; index < val.length; index++) {
                        await checkExist(val[index], User, { deleted: false });
                    }
                    return true;
                })
        ];
        return validations;
    },
    async adminSendToAllSpecificUsers(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            if (req.file) {
                let image = await handleImg(req, { attributeName: 'image', isUpdate: false });
                validatedBody.image = image;
            }

            let notifiObj = { titleOfNotification: validatedBody.titleOfNotification, resource: req.user.id, type: "USERS", subjectType: "ADMIN", description: validatedBody.text, users: validatedBody.users };
            if (validatedBody.image) notifiObj.image = validatedBody.image
            if (validatedBody.userType) {
                notifiObj.userType = validatedBody.userType;
            }
            await Notif.create(notifiObj)
            var allUsers = await User.find({ deleted: false, $or: [{ type: 'CLIENT' }, { type: ['DRIVER', 'INSTITUTION'], status: 'ACCEPTED' }], _id: { $in: validatedBody.users } });
            allUsers.forEach(async (user) => {
                if (user.notification) {
                    sendPushNotification(
                        {
                            targetUser: user,
                            subjectType: "ADMIN",
                            subjectId: 1,
                            text: validatedBody.text[user.language],
                            title: validatedBody.titleOfNotification[user.language],
                            image: (validatedBody.image) ? config.backend_endpoint + validatedBody.image : ''
                        });
                }
                notificationNSP.to('room-' + user.id).emit(socketEvents.NotificationsCount, { count: await Notif.countDocuments({ $or: [{ target: user.id }, { users: user.id }], informed: { $ne: user.id }, deleted: false, usersDeleted: { $ne: user.id } }) });

            });
            res.status(200).send("Successfully send to user");

        } catch (error) {
            next(error)

        }
    },
    create,
    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { resource, admin, subjectType, removeLanguage, userType } = req.query;
            let query = { deleted: false, subjectType: "ADMIN", type: { $ne: null } };
            if (resource) query.resource = resource;

            if (userType) {
                query.userType = userType;
            }
            if (subjectType) {
                query.subjectType = subjectType;
                delete query.type;
            }

            let notifs = await Notif.find(query).populate(populateQuery)
                .sort({ _id: -1 })
                .limit(limit)
                .skip((page - 1) * limit);
            if (!removeLanguage){
                notifs = Notif.schema.methods.toJSONLocalizedOnly(notifs, i18n.getLocale());
            }
                const notifsCount = await Notif.countDocuments(query);
                const pageCount = Math.ceil(notifsCount / limit);
                res.send(new ApiResponse(notifs, page, pageCount, limit, notifsCount, req));
        } catch (err) {
            next(err);
        }
    },


    async delete(req, res, next) {
        try {
            let { notifId } = req.params;
            let notif = await checkExistThenGet(notifId, Notif, { deleted: false });
            notif.deleted = true;
            await notif.save();
            res.send('notif deleted');
        } catch (error) {
            next(error);
        }
    },
    async userDelete(req, res, next) {
        try {
            let { notifId } = req.params;
            let notif = await checkExistThenGet(notifId, Notif, { deleted: false });
            await Notif.findByIdAndUpdate(notifId, { $push: { usersDeleted: req.user.id } });
            res.send('notif deleted');
        } catch (error) {
            next(error);
        }
    },
    async findById(req, res, next) {
        try {
            let { notifId } = req.params;
            let { removeLanguage } = req.query;
            let notifi = await checkExistThenGet(notifId, Notif, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                notifi = Notif.schema.methods.toJSONLocalizedOnly(notifi, i18n.getLocale());
            }
            res.status(200).send(notifi)

        } catch (err) {
            next(err)
        }
    },

    //////////////////////////////////////////////////////////////
    validateDeleteMulti() {
        return [
            body('ids').not().isEmpty().withMessage(() => { return i18n.__('idsRequired') }).isArray().withMessage('must be array'),
        ];
    },
    async deleteMuti(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN')
                return next(new ApiError(403, i18n.__('unauthrized')));

            let validatedBody = checkValidations(req);
            await Notif.updateMany({ _id: { $in: validatedBody.ids }, deleted: false }, { deleted: true, deletedDate: new Date() })
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    },
}