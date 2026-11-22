import Zone from '../../models/zone.model/zone.model.js';
import Address from '../../models/address.model/address.model.js';
import Category from '../../models/category.model/category.model.js';
import Product from '../../models/product.model/product.model.js';
import Promocode from '../../models/promocode.model/promocode.model.js';
import { body } from 'express-validator';
import { checkValidations } from '../shared.controller/shared.controller.js';
import { checkExistThenGet, checkExist } from '../../helpers/CheckMethods.js';
import ApiResponse from '../../helpers/ApiResponse.js';
import { generateVerifyCode } from '../../services/generator-code-service.js';
import moment from "moment";
import i18n from 'i18n'
import ApiError from '../../helpers/ApiError.js';
import User from '../../models/user.model/user.model.js';
import notifiController from '../notif.controller/notif.controller.js';
import Order from '../../models/order.model/order.model.js';
import socketEvents from '../../socketEvents.js'
import config from '../../config.js';
import userController from '../user.controller/user.controller.js';
import pluck from 'arr-pluck';

const populateQuery = [{ path: 'users', model: 'user' }, { path: 'zones', model: 'zone' }];
const allPopulated = [{ path: 'users', model: 'user' },
                { path: 'zones', model: 'zone' },
                { path: 'institutions', model: 'user' },
                { path: 'categories', model: 'category' },
                { path: 'products', model: 'product' }
            ]

let getZonesUsers = async (promo) => {
    try {
        let zones = promo.zones;
        let length = zones.length;
        let users = [];
        let query = { deleted: false };
        if (promo.users.length > 0) {
            query.user = { $in: promo.users }
        }
        for (let index = 0; index < length; index++) {
            query.geoLocation = { $geoWithin: { $center: [zones[index].location.coordinates, zones[index].radius] } }
            users.push(... await Address.find(query).distinct('user'));

        }
        users = await User.find({ deleted: false, _id: { $in: users } });
        return users;
    } catch (error) {
        console.log('getZonesUsers ==> Error Send notification for promo ', error);
        return [];
    }
}

let pushPromoNotification = async (promocode, admin) => {
    try {
        let users;
        promocode = promocode.toJSON();
        let desc = {
            ar: ` لديك كود خصم جديد ${promocode.code} `, en: `You have a new discount code ${promocode.code} `
        }
        if (promocode.categories.length > 0) {
            let arNames = promocode.categories.map((c) => c.name.ar || '');
            let enNames = promocode.categories.map((c) => c.name.en || '');
            arNames = arNames.join(',');
            enNames = enNames.join(',');

            desc.ar = desc.ar + ` علي الاقسام التالية ${arNames} `
            desc.en = desc.en + ` on this categories ${enNames}`
        } else if (promocode.products.length > 0) {
            let arNames = promocode.products.map((c) => c.name.ar || '');
            let enNames = promocode.products.map((c) => c.name.en || '');
            arNames = arNames.join(',');
            enNames = enNames.join(',');

            desc.ar = desc.ar + ` علي المنتجات التالية ${arNames} `
            desc.en = desc.en + ` on this products ${enNames}`
        } else if (promocode.institutions.length > 0) {
            let arNames = promocode.institutions.map((c) => c.name || '');
            arNames = arNames.join(',');

            desc.ar = desc.ar + ` علي المتاجر التالية ${arNames} `
            desc.en = desc.en + ` on this stores ${arNames}`
        }
        if (promocode.zones.length > 0) {
            users = await getZonesUsers(promocode);
        }
        else if (promocode.usersType === 'ALL') {
            users = await User.find({ type: 'CLIENT', deleted: false });
        } else {
            users = promocode.users //await User.find({ _id: { $in: promocode.users } });
        }
        let length = users.length;

        for (let index = 0; index < length; index++) {

            notifiController.pushNotification(users[index]._id, 'PROMOCODE', promocode.id, desc, users[index]);
            notifiController.create(admin.id, users[index]._id, desc, promocode.id, "PROMOCODE");
        }
    } catch (error) {
        console.log('pushPromoNotification ==> Error Send notification for promo ', error);
    }
}

let checkUserAddressInPromoZones = async (lat, long, promo) => {
    try {
        let zones = await Zone.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [+long, +lat]
                    },
                    distanceField: "distance",
                    key: 'location'
                }
            },
            {
                $match: { deleted: false, $and: [{ driver: { $eq: null } }, { trader: { $eq: null } }] }
            },
            {
                $redact: {
                    $cond: {
                        if: { $gt: ["$distance", "$radius"] },
                        then: "$$PRUNE",
                        else: "$$KEEP"
                    }
                }
            }
        ]);
        let ids = pluck(zones, '_id');
        console.log('ids ', ids, ids.length > 0 ? typeof (ids[0]) : 'no ids');
        if (promo.zones.some(r => ids.includes(r))) {
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
}


export default {
    async findAll(req, res, next) {
        try {
            let query = { deleted: false };
            let page = +req.query.page || 1,
                limit = +req.query.limit || 20;
            let skip = (page - 1) * limit;
            let { user, code, from, to, month, year, archive,
                usersType, numberOfUse, discount, startDate, endDate, promoCodeOn,
                zone, institution, product, category, noTarget,
                forZones, forInstitutions, forProducts, forCategories,
                promoCodeType
            } = req.query;
            if (promoCodeOn) query.promoCodeOn = promoCodeOn;
            if (archive) query.deleted = true;
            if (usersType) query.usersType = usersType;
            if (promoCodeType) query.promoCodeType = promoCodeType;

            if (forZones) {
                query.zones = { $ne: [] };
            }
            if (noTarget) {
                query.institutions = []
                query.products = []
                query.categories = []
                query.zones = []


            }
            if (forInstitutions) {
                query.institutions = { $ne: [] };
            }
            if (forProducts) {
                query.products = { $ne: [] };
            }
            if (forCategories) {
                query.categories = { $ne: [] };
            }

            if (zone) {
                query.zones = zone;
            }
            if (institution) {
                query.institutions = institution;
            }
            if (product) {
                query.products = product;
            }
            if (category) {
                query.categories = category;
            }
            if (user) {
                let userData = await checkExistThenGet(user, User)
                query.$or = [{ users: user, usersType: 'SPECIFIC' }, { usersType: 'ALL' }];
                query.deletedUsers = { $ne: user };

                query.createdAt = { $gte: new Date(userData.createdAt) }
            }
            if (numberOfUse) query.numberOfUse = numberOfUse;
            if (discount) query.discount = discount;
            if (startDate) {
                query.startDate = { $gte: new Date(moment(startDate).startOf('day')), $lte: new Date(moment(startDate).endOf('day')) };
            }
            if (endDate) {
                query.endDate = { $gte: new Date(moment(endDate).startOf('day')), $lte: new Date(moment(endDate).endOf('day')) };
            }
            if (code) {
                query.code = code
            }
            if (from) {
                query.startDate = { $gte: from }
            }
            if (to) {
                let date = new Date(to);
                to = moment(date).endOf('day')
                date = new Date(to);
                query.endDate = { $lte: to }
            }
            let date = new Date();
            if (year && !month) {
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('year');
                let endOfDate = moment(date).endOf('year');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            if (month && year) {
                month = month - 1;
                date.setMonth(month);
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('month');
                let endOfDate = moment(date).endOf('month');

                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            let promocodes = await Promocode.find(query).populate(allPopulated).limit(limit).skip(skip).sort({ _id: -1 });
            promocodes = await Promocode.schema.methods.toJSONLocalizedOnly(promocodes, i18n.getLocale());
            let totalCount = await Promocode.count(query);
            let pageCount = Math.ceil(totalCount / limit);

            res.status(200).send(new ApiResponse(promocodes, page, pageCount, limit, totalCount, req));

        } catch (error) {
            next(error);
        }
    },

    validateBody() {
        let validations = [

            body('zones').optional().not().isEmpty().withMessage(() => { return i18n.__('zonesRequired') }),
            body('zones.*').optional().not().isEmpty().withMessage(() => { return i18n.__('zonesRequired') })
                .custom(async (value) => {
                    await checkExist(value, Zone, { deleted: false });
                    return true;
                }),
            body('categories').optional().not().isEmpty().withMessage(() => { return i18n.__('categoryRequired') }),
            body('categories.*').optional().not().isEmpty().withMessage(() => { return i18n.__('categoryRequired') })
                .custom(async (value) => {
                    await checkExist(value, Category, { deleted: false });
                    return true;
                }),
            body('products').optional().not().isEmpty().withMessage(() => { return i18n.__('productRequired') }),
            body('products.*').optional().not().isEmpty().withMessage(() => { return i18n.__('productRequired') })
                .custom(async (value) => {
                    await checkExist(value, Product, { deleted: false });
                    return true;
                }),
            body('institutions').optional().not().isEmpty().withMessage(() => { return i18n.__('institutionsRequired') }),
            body('institutions').optional().not().isEmpty().withMessage(() => { return i18n.__('institutionsRequired') })
                .custom(async (value) => {
                    await checkExist(value, User, { deleted: false });
                    return true;
                }),


            body('code').optional().not().isEmpty().withMessage(() => { return i18n.__('codeRequired') })
                .custom(async (value, { req }) => {
                    console.log('req.body.startDate ',req.body.startDate);
                    let startDate =new Date(req.body.startDate).toJSON() , endDate = new Date(req.body.endDate).toJSON() ;
                    let startOfStartDate =  req.body.startDate //moment(startDate ).startOf('day');
                    let endOfEndDate = req.body.endDate //moment( endDate).endOf('day');
                    let query = { 
                        deleted: false, 
                        code: value, 
                        $or: [
                            { startDate: { $gte: new Date(startOfStartDate), $lte: new Date(endOfEndDate) } }, 
                            { endDate: { $gte: new Date(startOfStartDate), $lte: new Date(endOfEndDate) } }
                        ] 
                    }
                    let currentCode = await Promocode.findOne(query);
                    if (currentCode) {
                        return false;
                    }
                }).withMessage(() => { return i18n.__('duplicatedPromoCode') }),
            body('discount').not().isEmpty().withMessage(() => { return i18n.__('discountRequired') }),
            body('startDate').not().isEmpty().withMessage(() => { return i18n.__('startDateRequired') }),
            body('endDate').not().isEmpty().withMessage(() => { return i18n.__('endDateRequired') }),
            body('numberOfUse').not().isEmpty().withMessage(() => { return i18n.__('numberOfUseRequired') }),
            body('usersType').not().isEmpty().withMessage(() => { return i18n.__('usersTypeRequired') }).isIn(['ALL', 'SPECIFIC']).withMessage(() => { return i18n.__('invalidType') }).custom(async (value, { req }) => {
                if (value === 'SPECIFIC') {
                    if (!req.body.users) {
                        throw new Error('Enter the users');
                    }
                    if (req.body.users.length == 0) {
                        throw new Error('Enter the users');
                    }
                }
                return true;
            }),
            body('users').optional().not().isEmpty().withMessage(() => { return i18n.__('usersRequired') }),
            body('users.*').optional().not().isEmpty().withMessage(() => { return i18n.__('usersRequired') }).custom(async (val) => {
                await checkExist(val, User, { deleted: false });
                return true;
            }),
            body('promoCodeType').not().isEmpty().withMessage(() => { return i18n.__('promoCodeTypeRequired') }).isIn(['RATIO', 'VALUE']).withMessage(() => { return i18n.__('invalidType') }).custom(async (value, { req }) => {
                if (value === 'RATIO' && !req.body.maxAmount) {
                    throw new Error('maxAmountRequired');
                }
                return true;
            }),
            body('promoCodeOn').optional().not().isEmpty().withMessage(() => { return i18n.__('promoCodeTypeRequired') }).isIn(['TRANSPORTATION', 'PRODUCTS', 'ALL']).withMessage(() => { return i18n.__('invalidType') }),
            body('maxAmount').optional().not().isEmpty().withMessage(() => { return i18n.__('maxAmountRequired') }),

        ]
        return validations;
    },

    async create(req, res, next) {
        try {
            let data = checkValidations(req);
            if (!data.code) { data.code = generateVerifyCode(); }
            data.startDate = new Date(moment(new Date(data.startDate).toJSON()).startOf('day'));
            data.endDate = new Date(moment(new Date(data.endDate).toJSON()).endOf('day'));
            let promocode = await Promocode.create(data);

            res.status(201).send(promocode);
            // let query = [{ path: 'users', model: 'user' },
            // { path: 'zones', model: 'zone' },
            // { path: 'institutions', model: 'user' },
            // { path: 'categories', model: 'category' },
            // { path: 'products', model: 'product' }

            // ]
            promocode = await Promocode.populate(promocode, allPopulated)
            pushPromoNotification(promocode, req.user);
        } catch (error) {
            next(error);
        }
    },
    async findById(req, res, next) {
        try {
            let id = req.params.id;
            let promocode = await checkExistThenGet(id, Promocode, { deleted: false, populate: populateQuery });
            promocode = await Promocode.schema.methods.toJSONLocalizedOnly(promocode, i18n.getLocale());
            res.status(200).send(promocode);
        } catch (error) {
            next(error);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user;
            let id = req.params.id;
            let promocode = await checkExistThenGet(id, Promocode/*, { deleted: false }*/);

            if (user.type == 'CLIENT') {
                await Promocode.findByIdAndUpdate(id, { $addToSet: { deletedUsers: user.id } });
            } else {
                promocode.deleted = true;
                await promocode.save();
            }
            res.status(200).send('Deleted Successfully');
        } catch (error) {
            next(error);
        }
    },
    validateUpdateBody() {
        let validations = [

            body('zones').optional().not().isEmpty().withMessage(() => { return i18n.__('zonesRequired') }),
            body('zones.*').optional().not().isEmpty().withMessage(() => { return i18n.__('zonesRequired') })
                .custom(async (value) => {
                    await checkExist(value, Zone, { deleted: false });
                    return true;
                }),
            body('categories').optional().not().isEmpty().withMessage(() => { return i18n.__('categoryRequired') }),
            body('categories.*').optional().not().isEmpty().withMessage(() => { return i18n.__('categoryRequired') })
                .custom(async (value) => {
                    await checkExist(value, Category, { deleted: false });
                    return true;
                }),
            body('products').optional().not().isEmpty().withMessage(() => { return i18n.__('productRequired') }),
            body('products.*').optional().not().isEmpty().withMessage(() => { return i18n.__('productRequired') })
                .custom(async (value) => {
                    await checkExist(value, Product, { deleted: false });
                    return true;
                }),
            body('institutions').optional().not().isEmpty().withMessage(() => { return i18n.__('productRequired') }),
            body('institutions.*').optional().not().isEmpty().withMessage(() => { return i18n.__('productRequired') })
                .custom(async (value) => {
                    await checkExist(value, User, { deleted: false });
                    return true;
                }),
            body('code').optional().not().isEmpty().withMessage(() => { return i18n.__('codeRequired') }),
            body('discount').optional().not().isEmpty().withMessage(() => { return i18n.__('discountRequired') }),
            body('startDate').optional().not().isEmpty().withMessage(() => { return i18n.__('startDateRequired') }),
            body('endDate').optional().not().isEmpty().withMessage(() => { return i18n.__('endDateRequired') }),
            body('numberOfUse').optional().not().isEmpty().withMessage(() => { return i18n.__('numberOfUseRequired') }),
            body('usersType').optional().not().isEmpty().withMessage(() => { return i18n.__('usersTypeRequired') }).isIn(['ALL', 'SPECIFIC']).withMessage(() => { return i18n.__('invalidType') }).custom(async (value, { req }) => {
                if (value === 'SPECIFIC') {
                    if (!req.body.users) {
                        throw new Error('Enter the users');
                    }
                    if (req.body.users.length == 0) {
                        throw new Error('Enter the users');
                    }
                }
                return true;
            }),
            body('users').optional().not().isEmpty().withMessage(() => { return i18n.__('usersRequired') }),
            body('users.*').optional().not().isEmpty().withMessage(() => { return i18n.__('usersRequired') }).custom(async (val) => {
                await checkExist(val, User, { deleted: false });
                return true;
            }),
        ]
        return validations;
    },
    async update(req, res, next) {
        try {
            let id = req.params.id;
            let promocode = await checkExistThenGet(id, Promocode, { deleted: false });
            let data = checkValidations(req);
            promocode = await Promocode.findOneAndUpdate({ _id: id, deleted: false }, data, { new: true });
            res.status(200).send(promocode);
        } catch (error) {
            next(error);
        }
    },
    validateConfirm() {
        return [
            body('code').not().isEmpty().withMessage(() => { return i18n.__('codeRequired') }),
            body('location').optional().not().isEmpty().withMessage(() => { return i18n.__('latRequired') }),
            body('location.lat').optional().not().isEmpty().withMessage(() => { return i18n.__('latRequired') }),
            body('location.long').optional().not().isEmpty().withMessage(() => { return i18n.__('longRequired') })
        ]
    },
    async confirmCode(req, res, next) {
        try {
            let user = req.user;
            let validateBody = checkValidations(req);
            const code = validateBody.code;
            let location = validateBody.location;
            let currentDate = new Date();
            let query = {
                deleted: false,
                code: code,
                startDate: { $lte: currentDate },
                endDate: { $gte: currentDate },
                $or: [{ usersType: 'ALL' }, { usersType: 'SPECIFIC', users: { $elemMatch: { $eq: user.id } } }]
            };

            let promoCode = await Promocode.findOne(query);
            if (!promoCode) {
                return next(new ApiError(400, i18n.__('promoCodeInvalid')));
            }

            if (promoCode.zones.length > 0) {
                if (!(location && location.lat && location.long)) {
                    return next(new ApiError(400, i18n.__('locationRequired')));
                }
                let inZone = await checkUserAddressInPromoZones(location.lat, location.long, promoCode);
                if (!inZone) {
                    return next(new ApiError(400, i18n.__('outOfZone')));
                }
            }

            let count = await Order.count({ deleted: false, user: user.id, promoCode: promoCode.id });
            if (count >= promoCode.numberOfUse) {
                return next(new ApiError(400, i18n.__('ExccedPromoCodeNumberOuse')));
            }
            userController.updateUserSocket(user.id)
            promoCode = await Promocode.populate(promoCode,allPopulated)
            res.status(200).send(promoCode);
        } catch (error) {
            next(error);
        }
    },

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
            await Promocode.updateMany({ _id: { $in: validatedBody.ids }, deleted: false }, { deleted: true })
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    },

    async newAddressPromocodes(user, address) {
        try {
            let zones = await Zone.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [+address.long, address.lat]
                        },
                        distanceField: "distance",
                        key: 'location'
                    }
                },
                {
                    $match: { deleted: false, $and: [{ driver: { $eq: null } }, { trader: { $eq: null } }] }
                },
                {
                    $redact: {
                        $cond: {
                            if: { $gt: ["$distance", "$radius"] },
                            then: "$$PRUNE",
                            else: "$$KEEP"
                        }
                    }
                }
            ]);
            let ids = pluck(zones, '_id');

            console.log('iddddddd ', ids);

            let promos = await Promocode.find({ deleted: false, zones: { $elemMatch: { $in: ids } } });
            let length = promos.length;

            for (let index = 0; index < length; index++) {
                console.log('index ', index);
                let desc = {
                    ar: ' لديك كود خصم جديد ' + promos[index].code, en: ' You have a new discount code ' + promos[index].code
                }
                notifiController.pushNotification(user._id, 'PROMOCODE', promos[index]._id, desc, user);
                notifiController.create(user.id, user._id, desc, promos[index]._id, "PROMOCODE");
            }
        } catch (error) {
            throw error;
        }
    },

    checkUserAddressInPromoZones
}