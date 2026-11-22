import Order from "../../models/order.model/order.model.js";
import Zone from '../../models/zone.model/zone.model.js';
import User from '../../models/user.model/user.model.js';
import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist ,checkDateFilter} from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations, handleImg } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import moment from 'moment';
import notifyController from '../notif.controller/notif.controller.js';
import socketEvents from '../../socketEvents.js';
import Company from '../../models/company.model/company.model.js';
import config from '../../config.js';
import { sendEmail, sendHtmlEmail, sendChangeOrderEmail } from '../../services/emailMessage.service.js';
import schedule from 'node-schedule';
import orderCreator from './normal-order.js';
import orderHelper from './helpers.js';
import userController from '../user.controller/user.controller.js';

let populateQuery = [
    { path: 'user', model: 'user' },
    { path: 'acceptedUser', model: 'user' },
    { path: 'paymentTransaction', model: 'paymentTransaction' },
    { path: 'branch', model: 'user' },
    { path: 'driver', model: 'user' },
    { path: 'trader', model: 'user' },
    { path: 'products.product', model: 'product', populate: [{ path: 'trader', model: 'user' }, { path: 'productCategory', model: 'productCategory' }] },
    { path: 'address', model: 'address', populate: [{ path: 'city', model: 'city', populate: [{ path: 'country', model: 'country' }] }] },
    { path: 'promoCode', model: 'promocode' },
    { path: 'offers.driver', model: 'user' },
    { path: 'branch', model: 'user' }
];


const orderService = async (order) => {
    try {
        let date = (new Date()).getTime();
        let company = await Company.findOne({ deleted: false });
        date = date + company.driverWaitingTime;
        date = new Date(date);
        console.log('will fire on ', date)

        let jobName = 'order-' + order.id;
        let currentOrder = await checkExistThenGet(order.id, Order, { populate: populateQuery });

        let j = schedule.scheduleJob(jobName, date, async (fireDate) => {
            try {
                console.log(jobName, ' fire date ', fireDate);
                currentOrder = await checkExistThenGet(order.id, Order);
                console.log(currentOrder)
                if (currentOrder.status == 'ACCEPTED') {
                    let validatedBody = { $addToSet: { rejectedDrivers: currentOrder.driver }, $unset: { driver: 1 } };
                    let updatedOrder = await Order.findByIdAndUpdate(order.id, validatedBody, { new: true }).populate(populateQuery);
                    notificationNSP.to('room-' + currentOrder.driver).emit(socketEvents.OrderExpired, { order: updatedOrder });
                    findDriver(updatedOrder,company);
                }
            } catch (error) {
                throw error;
            }
        })
    } catch (error) {
        throw error;
    }
}

const findDriver = async (order, company, maxDistance /* in m */) => {
    try {
        // let busyDrivers = await Order.find({ deleted: false, status: { $in: ['WAITING', 'ACCEPTED', 'DRIVER_ACCEPTED', 'SHIPPED'], } }).distinct('driver');
        // busyDrivers = busyDrivers.map((value) => { return +value })
        // console.log(busyDrivers, rejectedDrivers);
        let rejectedDrivers = order.rejectedDrivers.map((value) => { return +value });

        let driverQuery = {
            'driver.deleted': false,
            'driver.online': true,
            'driver.activated': true,
            'driver.status': 'ACCEPTED',
            'driver.type': 'DRIVER',
            // $and: [{ 'driver._id': { $nin: busyDrivers } }, { 'driver._id': { $nin: rejectedDrivers } }]
            'driver._id': { $nin: rejectedDrivers }
        };

        //let company = await Company.findOne({ deleted: false });
        company.startSearchDistance = Number(company.startSearchDistance);
        company.endSearchDistance = Number(company.endSearchDistance);
        company.increaseSearchDistanceBy = Number(company.increaseSearchDistanceBy);

        if (!maxDistance) {
            maxDistance = company.startSearchDistance * 1000;
        } else {
            if (maxDistance > (company.endSearchDistance * 1000)) {
                console.log('max search distance reached');
                order = await Order.findByIdAndUpdate(order.id, { status: 'NOT_ASSIGN' }, { new: true });
                await orderHelper.notAssignCount();
                return;
            }
        }

        let driver;
        let drivers = await Zone.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [+order.userAddress.long, +order.userAddress.lat]
                    },
                    distanceField: "distance",
                    maxDistance: maxDistance,
                    spherical: true,
                    query: { deleted: false, driver: { $ne: null } },
                    key:'currentDriverLocation'
                }
            },
            {
                $redact: {
                    $cond: {
                        if: { $gt: ["$distance", "$radius"] },
                        then: "$$PRUNE",
                        else: "$$KEEP"
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'driver',
                    foreignField: '_id',
                    as: 'driver'
                }
            },
            {
                $unwind: '$driver'
            },
            {
                $match: driverQuery
            },
            {
                $sort: { "distance": 1 }
            },
            {
                $limit: 10
            }
        ]);

        console.log('=========== drivers =========================');
        console.log(drivers.length, maxDistance);
        console.log(drivers);
        console.log('====================================');

        if (drivers && (drivers.length > 0)) {
            driver = drivers[0];
        } else {
            findDriver(order, company, maxDistance + (company.increaseSearchDistanceBy * 1000));
            return;
        }

        if (driver) {
            order.driver = driver.driver._id;
            order = await Order.findByIdAndUpdate(order.id, { driver: driver.driver._id, driverAssignDate: new Date() }, { new: true }).populate(populateQuery)
            console.log('before service ', company.driverWaitingTime, order.driverAssignDate);
            orderService(order, company);
            console.log('driver.driver._id socket ', driver.driver._id);
            notificationNSP.to('room-' + driver.driver._id).emit(socketEvents.NewOrder, { order: order });
            let description = { ar: 'لديك طلب جديد \n '+`${order.orderNumber}`, en: `You have a new Order \n ${order.orderNumber} ` }
            await notifyController.create(order.user.id, driver.driver._id, description, order.id, 'ORDER', order.id, order.status);
            notifyController.pushNotification(driver.driver._id, 'ORDER', order.id, description);
            orderHelper.driverOrdersCount(driver.driver._id);
        } else {
            order = await Order.findByIdAndUpdate(order.id, { status: 'NOT_ASSIGN' }, { new: true });
        }
    } catch (error) {
        console.log('error in find driver ', error);
        throw error;
    }
}

export default {

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { user, status, paymentMethod, month, year, fromDate, toDate, type,
                userName, price, orderDate, totalPrice, promoCode, orderType, driver,
                orderNumber, numberOfProducts, waitingOrders, canceledOrders, 
                currentOrders, finishedOrders, traderNotResponse, trader,
                activeOrders, pendingOrders,branch
            } = req.query;
            let sortQuery ={ _id: -1 }
            let query = {
                // type: { $ne: 'FAST' },
                deleted: false,
                // $or: [{ paymentMethod: 'DIGITAL', paymentStatus: 'SUCCESSED' }, { paymentMethod: { $in: ['CASH', 'WALLET'] } }]
            };

            checkDateFilter(req,query,sortQuery)

            if (branch) query.branch = branch;
            // if (trader) query.trader = trader;
            // if (orderType) query.orderType = orderType;
            // if (driver) query.driver = driver;

            if (activeOrders) {
                query.status = { $in: ['ACCEPTED', 'DRIVER_ACCEPTED', 'PREPARED', 'SHIPPED', 'NOT_ASSIGN'] };
            }
            if (pendingOrders) {
                query.status = 'WAITING';
            }

            if (req.user.type == 'CLIENT') {
                query.user = req.user.id;
                if (currentOrders) {
                    query.status = { $in: ['WAITING', 'ACCEPTED', 'DRIVER_ACCEPTED', 'SHIPPED', 'PREPARED', 'NOT_ASSIGN'] }
                } else if (finishedOrders) {
                    query.status = { $in: ['DELIVERED'] }

                } else if (canceledOrders) {
                    query.status = { $in: ['TRADER_CANCELED', 'CLIENT_CANCELED', 'ADMIN_CANCELED', 'REJECTED'] }
                }
            }
            else if (req.user.type == 'INSTITUTION') {  
                query.branch = req.user.headBranch ? req.user.headBranch : req.user.id  //req.user.id;
                if (waitingOrders) {
                    query.status = { $in: ['WAITING'] };
                    // query.traderNotResponse = false;
                    // query.traderRejected = false

                } else if (currentOrders) {
                    query.status = { $in: ['ACCEPTED', 'DRIVER_ACCEPTED', 'SHIPPED', 'PREPARED', 'NOT_ASSIGN'] }

                } else if (finishedOrders) {
                    query.status = { $in: ['DELIVERED' ] }

                }else if (canceledOrders) {
                    query.status = { $in: [ 'REJECTED', 'TRADER_CANCELED', 'CLIENT_CANCELED', 'ADMIN_CANCELED'] }
                }

            }
            // else if (req.user.type == 'DRIVER') {
            //     query.driver = req.user.id;
            //     query.orderType = 'DELIVERY';
            //     if (waitingOrders) {
            //         query.status = { $in: ['ACCEPTED'] }
            //     }
            //     else if (currentOrders) {
            //         query.status = (type == 'FAST')? { $in: ['WAITING', 'ACCEPTED', 'DRIVER_ACCEPTED', 'SHIPPED', 'PREPARED'] } : { $in: ['DRIVER_ACCEPTED', 'SHIPPED', 'PREPARED'] }

            //     } else if (finishedOrders) {
            //         query.status = { $in: ['DELIVERED'] }
            //     }else if (canceledOrders) {
            //         query.status = { $in: [ 'TRADER_CANCELED', 'CLIENT_CANCELED', 'ADMIN_CANCELED'] }
            //     }
            // }
            let date = new Date();
            // if (traderNotResponse) {
            //     // query.traderNotResponse = traderNotResponse;
            //     query.$or = [{ traderNotResponse: traderNotResponse }, { traderRejected: true }]
            //     query.status = 'WAITING';
            // }
            if (orderDate) query.createdAt = { $gte: new Date(moment(orderDate).startOf('day')), $lt: new Date(moment(orderDate).endOf('day')) };

            if (userName) {
                let userIds = await User.find({ deleted: false, name: { '$regex': userName, '$options': 'i' } }).distinct('_id');
                query.user = { $in: userIds };
            }
            if (orderNumber) query.orderNumber = { '$regex': orderNumber, '$options': 'i' };
            if (promoCode) query.promoCode = promoCode;
            if (numberOfProducts || (numberOfProducts == 0)) query.products = { $size: numberOfProducts };
            if (user) query.user = user;
            if (totalPrice) query.totalPrice = totalPrice;
            if (price) query.price = price;
            if (type) query.type = type;
            if (status) query.status = status;
            if (paymentMethod) query.paymentMethod = paymentMethod;
            // if (fromDate && !toDate) query.createdAt = { $gte: moment(fromDate).startOf('day') };
            // if (toDate && !fromDate) query.createdAt = { $lt: moment(toDate).endOf('day') };
            // if (fromDate && toDate) query.createdAt = { $gte: moment(fromDate).startOf('day'), $lt: moment(toDate).endOf('day') };
            // if (month && year) {
            //     date = new Date();
            //     month = month - 1;
            //     date.setMonth(month);
            //     date.setFullYear(year);
            //     let startOfDate = moment(date).startOf('month');
            //     let endOfDate = moment(date).endOf('month');

            //     query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            // }
            // else if (year && !month) {
            //     date.setFullYear(year);
            //     let startOfDate = moment(date).startOf('year');
            //     let endOfDate = moment(date).endOf('year');
            //     query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            // }

            let orders = await Order.find(query).populate(populateQuery).sort(sortQuery).limit(limit).skip((page - 1) * limit);
            orders = Order.schema.methods.toJSONLocalizedOnly(orders, i18n.getLocale());
            let ordersCount = await Order.count(query);
            const pageCount = Math.ceil(ordersCount / limit);
            res.send(new ApiResponse(orders, page, pageCount, limit, ordersCount, req));


        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { orderId } = req.params;
            let { removeLanguage } = req.query;

            let order = await checkExistThenGet(orderId, Order, {  populate: populateQuery });
            if (!removeLanguage) {
                order = Order.schema.methods.toJSONLocalizedOnly(order, i18n.getLocale());
            }
            res.status(200).send(order);

        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let { orderId } = req.params;
            let order = await checkExistThenGet(orderId, Order, { deleted: false });
            order.deleted = true;
            await order.save();
            res.status(200).send("Deleted Successfully");
            orderHelper.clientOrdersCount(order.user);

        }
        catch (err) {
            next(err);
        }
    },

    validateAcceptOrReject() {
        let validations = [
            body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('statusRequired') })
                .isIn(['ACCEPTED', 'REJECTED']).withMessage(() => { return i18n.__('statusRequired') }).custom((val, { req }) => {
                    if (val == 'REJECTED' && !req.body.rejectReason) {
                        throw new Error(i18n.__('rejectReasonRequired'))
                    }
                    return true;
                }),
            body('rejectReason').optional().not().isEmpty().withMessage(() => { return i18n.__('rejectReasonRequired') })
        ];
        return validations;
    },

    async acceptOrReject(req, res, next) {
        try {
            let user = req.user;
            if ( ! ['ADMIN','SUB_ADMIN','INSTITUTION'].includes(user.type) ) //user.type != 'ADMIN' && user.type != 'SUB_ADMIN' && user.type != 'INSTITUTION'
                return next(new ApiError(403, ('notAllowToChangeStatus')));

            let { orderId } = req.params;
            let orderData =  await checkExistThenGet(orderId, Order, { deleted: false, status: 'WAITING' });
            if (orderData.traderRejected) {
                return next(new ApiError(400,i18n.__('traderRejected') ));
            }
            let validatedBody = checkValidations(req);
            validatedBody.acceptedUser = user.id;
            let status = validatedBody.status;
            if (status == 'ACCEPTED') {
                validatedBody.acceptedDate = new Date();
            } else {
                if ((req.user.type == 'INSTITUTION') && (status == 'REJECTED')) {
                    validatedBody.traderRejected = true;
                    validatedBody.traderRejectedDate = new Date();
                    // delete validatedBody.status;
                } else {
                    validatedBody.rejectedDate = new Date();
                }
            }
            let updatedOrder = await Order.findByIdAndUpdate(orderId, validatedBody, { new: true }).populate(populateQuery);

            if ((updatedOrder.paymentMethod == 'POINTS') && (status == 'REJECTED')) {
                let client = updatedOrder.user;
                client.points = client.points + updatedOrder.points;
                await client.save();
                userController.updateUserSocket(client.id);

            }
            if ((req.user.type != 'INSTITUTION') && (status == 'REJECTED')) {
                await orderHelper.refundOrderMoney(updatedOrder);
            }

            updatedOrder = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send(updatedOrder);
            let description;

            if (status == 'ACCEPTED') {
                ////////////// find drivers /////////////////////////
                if (updatedOrder.orderType == 'DELIVERY'){
                    let company = await Company.findOne({deleted:false});
                    await findDriver(updatedOrder,company);
                } 
                ////////////////////////////////////////////////////
                if (updatedOrder.type == 'BOOKING') {
                    description = { en: ` Your reservation has been approved \n ${updatedOrder.trader.name}`, 
                        ar:  `  $ جاري العمل علي الحجز من` +`\n ${updatedOrder.trader.name}` 
                    };
                } else {
                    description = { en: `Your order has been approved \n ${updatedOrder.trader.name}`, 
                        ar:  `  ${updatedOrder.orderNumber}  \n جاري تجهيز طلبك من` +`\n ${updatedOrder.trader.name}` 
                    };
                }
                // description = { en: `Your order has been approved \n ${updatedOrder.trader.name}`, 
                //     ar:  `  ${updatedOrder.orderNumber}  \n جاري تجهيز طلبك من` +`\n ${updatedOrder.trader.name}` 
                // };
            } else {
                let reasone = validatedBody.rejectReason ? validatedBody.rejectReason : '';
                

                if (updatedOrder.type == 'BOOKING') {
                    description = {
                        en: `We apologize, there is no possibility of reservation`,
                        ar: `نعتذر منكم لايوجد إمكانية للحجز`
                    };
                } else {
                    description = {
                        en: `We are sorry, we will not be able to fulfill your order currently , and the payments will be refunded due to \n ` + reasone,
                        ar: ` لم نتمكن من اتمام الطلب الخاص بكم والسبب\n  ` + reasone
                    };
                }
                
                
                
            }

            if ((req.user.type == 'ADMIN') || (req.user.type == 'SUB_ADMIN') || (status == 'ACCEPTED')) {
                await notifyController.create(req.user.id, updatedOrder.user.id, description, updatedOrder.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, validatedBody.status);
                notifyController.pushNotification(updatedOrder.user.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, description);
                notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });

                if (updatedOrder.user.language == "ar") {
                    // await sendChangeOrderEmail(updatedOrder.user.email, description.ar + ' : ' + updatedOrder.orderNumber)
                }
                else {
                    // await sendChangeOrderEmail(updatedOrder.user.email, description.en + ' : ' + updatedOrder.orderNumber)
                }
            }
            orderHelper.cancelJob('trader-order-' + updatedOrder.id);
        } catch (err) {
            
            next(err);
        }
    },

    async prepared(req, res, next) {
        try {
            if (req.user.type != 'ADMIN' && req.user.type != 'SUB_ADMIN' && req.user.type != 'INSTITUTION')
                return next(new ApiError(403, ('admin.auth')));

            let { orderId } = req.params;
            await checkExist(orderId, Order, {
                deleted: false,
                $or: [{ status: "ACCEPTED", orderType: "FROM_STORE" }, { status: "DRIVER_ACCEPTED", orderType: "DELIVERY" }]
            });

            let updatedOrder = await Order.findByIdAndUpdate(orderId, { status: 'PREPARED', prepareDate: new Date() }, { new: true }).populate(populateQuery);
            updatedOrder = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send(updatedOrder);

            let description = { ar: ' تم تغير حالة الطلب الي تم التجهيز ', en: 'Order status changed to order prepared' };

            await notifyController.create(req.user.id, updatedOrder.user.id, description, updatedOrder.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, 'PREPARED');
            notifyController.pushNotification(updatedOrder.user.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, description);

            notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });

            if (updatedOrder.driver) {
                await notifyController.create(req.user.id, updatedOrder.driver.id, description, updatedOrder.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, 'PREPARED');
                notifyController.pushNotification(updatedOrder.driver.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, description);
                notificationNSP.to('room-' + updatedOrder.driver.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });
            }
            // if (updatedOrder.user.language == "ar") {
            //     await sendChangeOrderEmail(updatedOrder.user.email, description.ar + ' : ' + updatedOrder.orderNumber)
            // }
            // else {
            //     await sendChangeOrderEmail(updatedOrder.user.email, description.en + ' : ' + updatedOrder.orderNumber)
            // }
        } catch (err) {
            next(err);
        }
    },

    validateDriverAcceptOrReject() {
        let validations = [
            body('status').optional().not().isEmpty().withMessage(() => { return i18n.__('statusRequired') })
                .isIn(['DRIVER_ACCEPTED', 'REJECTED']).withMessage(() => { return i18n.__('invalidStatus') })
        ];
        return validations;
    },

    async driverAcceptOrReject(req, res, next) {
        try {
            if (req.user.type != 'DRIVER')
                return next(new ApiError(403, ('notAllowToChangeStatus')));

            let { orderId } = req.params;
            await checkExist(orderId, Order, { deleted: false, status: 'ACCEPTED', driver: req.user.id });
            let updatedOrder;
            let validatedBody = checkValidations(req);
            if (validatedBody.status == 'DRIVER_ACCEPTED') {
                validatedBody.driverAcceptedDate = new Date();
                updatedOrder = await Order.findByIdAndUpdate(orderId, validatedBody, { new: true }).populate(populateQuery);
                notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });
                notificationNSP.to('room-' + updatedOrder.trader.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });

            } else {
                validatedBody['$addToSet'] = { rejectedDrivers: req.user.id };
                validatedBody['$unset'] = { driver: 1, driverAssignDate: 1 }
                delete validatedBody.status;
                updatedOrder = await Order.findByIdAndUpdate(orderId, validatedBody, { new: true }).populate(populateQuery);
                let company = await Company.findOne({deleted:false});
                await findDriver(updatedOrder,company);
            }
            updatedOrder = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send(updatedOrder);
        } catch (err) {
            next(err);
        }
    },

    async shipped(req, res, next) {
        try {
            if (req.user.type != 'ADMIN' && req.user.type != 'SUB_ADMIN' && req.user.type != 'INSTITUTION')
                return next(new ApiError(403, ('admin.auth')));

            let { orderId } = req.params;
            await checkExist(orderId, Order, { deleted: false, $or: [{ status: "ACCEPTED", orderType: "FROM_STORE" }, { status: "PREPARED", orderType: "DELIVERY" }] });
            let updatedOrder = await Order.findByIdAndUpdate(orderId, { status: 'SHIPPED', shippedDate: new Date() }, { new: true }).populate(populateQuery);
            updatedOrder = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send(updatedOrder);

            let description = { ar: ' تم تغير حالة الطلب الي تم الشحن ', en: 'order status changed to order shipped' };

            await notifyController.create(req.user.id, updatedOrder.user.id, description, updatedOrder.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, updatedOrder.status);
            notifyController.pushNotification(updatedOrder.user.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, description);

            notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });

            if (updatedOrder.user.language == "ar") {
                // await sendChangeOrderEmail(updatedOrder.user.email, description.ar + ' : ' + updatedOrder.orderNumber)
            }
            else {
                // await sendChangeOrderEmail(updatedOrder.user.email, description.en + ' : ' + updatedOrder.orderNumber)
            }
        } catch (err) {
            next(err);
        }
    },

    validateTraderCancel() {
        return [
            body('traderCancelReasone').not().isEmpty().withMessage(() => { return i18n.__('traderCancelReasoneRequired') })
        ]
    },

    async traderCancel(req, res, next) {
        try {
            if (req.user.type != 'INSTITUTION')
                return next(new ApiError(403, ('unauthrized')));

            let { orderId } = req.params;
            let validatedBody = checkValidations(req);

            await checkExist(orderId, Order, { deleted: false , status:{$nin:['DELIVERED', 'CLIENT_CANCELED','TRADER_CANCELED','ADMIN_CANCELED']}});

            let updateQuery = { status: 'TRADER_CANCELED', traderCancelReasone: validatedBody.traderCancelReasone, traderCancelDate: new Date() };

            let updatedOrder = await Order.findByIdAndUpdate(orderId, updateQuery, { new: true }).populate(populateQuery);

            await orderHelper.refundOrderMoney(updatedOrder);

            updatedOrder = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send(updatedOrder);
            let description = {
                en: `We are sorry, we will not be able to fulfill your order currently from  ${req.user.name}, and the payments will be refunded due to \n ` + validatedBody.traderCancelReasone,
                ar: `لم نتمكن من اتمام طلب الحجز الخاص بكم والسبب\n` + validatedBody.traderCancelReasone
            };

            await notifyController.create(req.user.id, updatedOrder.user.id, description, updatedOrder.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, 'TRADER_CANCELED');
            notifyController.pushNotification(updatedOrder.user.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, description);

            notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });
            adminNSP.to('room-admin').emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });

            // if (updatedOrder.user.language == "ar") {
            //     await sendChangeOrderEmail(updatedOrder.user.email, description.ar + ' : ' + updatedOrder.orderNumber)
            // }
            // else {
            //     await sendChangeOrderEmail(updatedOrder.user.email, description.en + ' : ' + updatedOrder.orderNumber)
            // }
        } catch (err) {
            next(err);
        }
    },

    validateAdminCancel() {
        return [
            body('adminCancelReasone').optional().not().isEmpty().withMessage(() => { return i18n.__('adminCancelReasoneRequired') })
        ]
    },

    async adminCancel(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, ('admin.auth')));
            }

            let { orderId } = req.params;
            let validatedBody = checkValidations(req);

            await checkExist(orderId, Order, { deleted: false  , status:{$nin:['DELIVERED', 'CLIENT_CANCELED','TRADER_CANCELED','ADMIN_CANCELED']} });

            let updateQuery = { status: 'ADMIN_CANCELED', adminCancelDate: new Date() };

            if (validatedBody.adminCancelReasone) {
                updateQuery.adminCancelReasone = validatedBody.adminCancelReasone;
            }
            let updatedOrder = await Order.findByIdAndUpdate(orderId, updateQuery, { new: true }).populate(populateQuery);

            await orderHelper.refundOrderMoney(updatedOrder);

            updatedOrder = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send(updatedOrder);
            
            let reasone = validatedBody.adminCancelReasone ? validatedBody.adminCancelReasone : '';
            let description = {
                en: `We are sorry, we will not be able to fulfill your order currently , and the payments will be refunded due to \n ` + reasone,
                ar: ` لم نتمكن من اتمام طلب الحجز الخاص بكم والسبب\n  ` + reasone
            };

            await notifyController.create(req.user.id, updatedOrder.user.id, description, updatedOrder.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, 'ADMIN_CANCELED');
            notifyController.pushNotification(updatedOrder.user.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, description);

            notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });

            // if (updatedOrder.user.language == "ar") {
            //     await sendChangeOrderEmail(updatedOrder.user.email, description.ar + ' : ' + updatedOrder.orderNumber)
            // }
            // else {
            //     await sendChangeOrderEmail(updatedOrder.user.email, description.en + ' : ' + updatedOrder.orderNumber)
            // }
        } catch (err) {
            next(err);
        }
    },

    async clientCanceled(req, res, next) {
        try {
            let user = req.user;
            let { orderId } = req.params;
            let order = await checkExistThenGet(orderId, Order, {status:{$nin:['DELIVERED']} ,deleted: false, user: user.id, populate: populateQuery }, i18n.__('notAllowToCancel'));

            order.status = 'CLIENT_CANCELED';
            order.clientCancelDate = new Date();

            await order.save();
            res.status(200).send(order);

            await orderHelper.refundOrderMoney(order);

            let description = { ar: `تم الغاء الطلب من قبل ${req.user.name}  `, en: `Your order has been canceled from ${req.user.name} ` };


            await notifyController.create(user.id, order.trader.id, description, order.id, 'CHANGE_ORDER_STATUS', order.id, 'CLIENT_CANCELED');
            notifyController.pushNotification(order.trader.id, 'CHANGE_ORDER_STATUS', order.id, description);
            notificationNSP.to('room-' + order.trader.id).emit(socketEvents.ChangeOrderStatus, { order: order });
            adminNSP.to('room-admin').emit(socketEvents.ChangeOrderStatus, { order: order });

        } catch (err) {

            next(err);
        }
    },

    validateDelivered() {
        return [
            body('payed').optional().not().isEmpty().withMessage(() => { return i18n.__('payedRequired') })
        ]
    },

    async delivered(req, res, next) {
        try {
            let { orderId } = req.params;
            let user = req.user;
            let order = await checkExistThenGet(orderId, Order, { deleted: false, status: { $ne: 'DELIVERED' } /*, driver:user.id,status:'DRIVER_ACCEPTED'*/ });
            let validatedBody = checkValidations(req);
            let updatedQuery = { status: 'DELIVERED', deliveredDate: new Date() };
            if (validatedBody.payed) {
                console.log(validatedBody.payed, order.finalPrice);
                if (validatedBody.payed <= order.finalPrice) {
                    return next(new ApiError(400, i18n.__('noMoneyToConvert')));
                }
                updatedQuery.convertedMoney = validatedBody.payed - order.finalPrice;
            }

            let updatedOrder = await Order.findByIdAndUpdate(orderId, updatedQuery, { new: true }).populate(populateQuery);
            updatedOrder = await Order.populate(updatedOrder, populateQuery);

            res.status(200).send({ order: updatedOrder });

            let client = updatedOrder.user;
            let points =  await orderHelper.calculatePoints(updatedOrder) || 0;
            client.points = client.points + points;

            if (updatedOrder.convertedMoney) {
                client.wallet = client.wallet + updatedOrder.convertedMoney;
                await client.save();

                let money = updatedOrder.convertedMoney.toFixed(2)
                let desc = { ar: `تم تحويل ${money} جنيه الي محفظتك`, en: `Driver converted ${money} into your portfolio` };
                await notifyController.create(req.user.id, updatedOrder.user.id, desc, updatedOrder.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, 'DELIVERED');
                notifyController.pushNotification(updatedOrder.user.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, desc);
            }else if (points){
                await client.save();
            }
            userController.updateUserSocket(client.id);

            let description = { ar: ' تم تغير حالة الطلب الي تم التسليم ', en: 'Order status changed to delivered' };
            await notifyController.create(req.user.id, updatedOrder.user.id, description, updatedOrder.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, 'DELIVERED');
            notifyController.pushNotification(updatedOrder.user.id, 'CHANGE_ORDER_STATUS', updatedOrder.id, description);
            notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });

            // if (updatedOrder.user.language == "ar") {
            //     await sendChangeOrderEmail(updatedOrder.user.email, description.ar + ' : ' + updatedOrder.orderNumber)
            // }
            // else {
            //     await sendChangeOrderEmail(updatedOrder.user.email, description.en + ' : ' + updatedOrder.orderNumber)
            // }
            // if (updatedOrder.driver) {
            //     orderHelper.driverOrdersCount(updatedOrder.driver.id);
            //     notificationNSP.to('room-' + updatedOrder.trader.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });
            //     orderHelper.traderOrdersCount(updatedOrder.trader.id);


            //     notificationNSP.to('room-' + updatedOrder.driver.id).emit(socketEvents.NewRate, { order: updatedOrder });

            // }
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            notificationNSP.to('room-' + updatedOrder.trader.id).emit(socketEvents.NewRate, { order: updatedOrder });
            notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.NewRate, { order: updatedOrder });

        } catch (err) {
            console.log(err);
            next(err);
        }
    },
    async addInvoice(req, res, next) {
        try {
            let { orderId } = req.params;
            let user = req.user;
            let order = await checkExistThenGet(orderId, Order, { deleted: false });

            let updateQuery = {};
            if (req.file) {
                updateQuery.invoiceImage = handleImg(req, { attributeName: 'invoiceImage', isUpdate: false });
            } else {
                return next(new ApiError(404, i18n.__('invoiceImageRequired')));
            }
            let updatedOrder = await Order.findByIdAndUpdate(orderId, updateQuery, { new: true }).populate(populateQuery);
            order = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send({ order });

            let description = { ar: 'تم اضافة فاتورة للطلب ', en: 'Order invoice added.' };
            await notifyController.create(req.user.id, updatedOrder.user.id, description, updatedOrder.id, 'INVOICE', updatedOrder.id, updatedOrder.status);
            notifyController.pushNotification(updatedOrder.user.id, 'INVOICE', updatedOrder.id, description);
            notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });

        } catch (error) {
            next(error);
        }
    },

    /////////////////////////////////////////////////////////////////////////////////

    validateResendOrderToTrader() {
        let validations = [
            body('order').not().isEmpty().withMessage(() => { return i18n.__('orderRequired') })
        ];
        return validations;
    },
    async resendOrderToTrader(req, res, next) {
        try {
            if (req.user.type != 'ADMIN' && req.user.type != 'SUB_ADMIN')
                return next(new ApiError(403, ('notAllowToChangeStatus')));

            let validatedBody = checkValidations(req);
            let updateQuery = { traderNotResponse: false, traderAssignDate: new Date(), traderRejected: false }
            await checkExist(validatedBody.order, Order, { deleted: false, status: 'WAITING'/*, traderNotResponse: true*/ });
            let updatedOrder = await Order.findByIdAndUpdate(validatedBody.order, updateQuery, { new: true }).populate(populateQuery);
            updatedOrder = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send(updatedOrder);

            let company = await Company.findOne({ deleted: false });
            console.log(updatedOrder.traderAssignDate);
            orderCreator.traderService(updatedOrder, company, updatedOrder.traderAssignDate);


            let description = { en: 'The admin sent the order back to you. Please accept the order as soon as possible.', ar: '  قام الادمن بإعادة ارسال الطلب اليك مرة اخري من فضلك وافق على الطلب في اسرع وقت ' };
            await notifyController.create(req.user.id, updatedOrder.trader.id, description, updatedOrder.id, 'ORDER', updatedOrder.id, updatedOrder.status);
            notifyController.pushNotification(updatedOrder.trader.id, 'ORDER', updatedOrder.id, description);
            notificationNSP.to('room-' + updatedOrder.trader.id).emit(socketEvents.NewOrder, { order: updatedOrder });
            orderHelper.traderOrdersCount(updatedOrder.trader.id);

        } catch (err) {
            next(err);
        }
    },

    validateAssignToDriver() {
        return [
            body('driver').not().isEmpty().withMessage(() => { return i18n.__('driverRequired') })
                .custom(async (value, { req }) => {
                    req.driver = await checkExistThenGet(value, User, { deleted: false, type: 'DRIVER' });
                    return true;
                })
        ]
    },

    async assignToDriver(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            validatedBody.driverAssignDate = new Date();
            validatedBody.status = 'ACCEPTED'; 
            let { orderId } = req.params;
            let order = await checkExistThenGet(orderId, Order, { deleted: false, /*status: 'NOT_ASSIGN'*/ });
            let driver = req.driver;
            let company = await Company.findOne({ deleted: false });

            let updatedOrder = await Order.findByIdAndUpdate(orderId, validatedBody, { new: true }).populate(populateQuery);
            res.status(200).send({ updatedOrder });

            orderService(updatedOrder, company);
            notificationNSP.to('room-' + driver.id).emit(socketEvents.NewOrder, { order: updatedOrder });
            let description = { ar: 'لديك طلب جديد \n '+`${updatedOrder.orderNumber}`, en: `You have a new Order \n ${updatedOrder.orderNumber} ` };
            await notifyController.create(updatedOrder.user.id, driver.id, description, updatedOrder.id, 'ORDER', order.id, order.status);
            notifyController.pushNotification(driver.id, 'ORDER', updatedOrder.id, description);
        } catch (error) {
            next(error);
        }
    },

    ///////////////////////////////waiting Rate/////////////////////////////////////////
    validateRate() {
        let validations = [
            body('rateEmotion').not().isEmpty().withMessage(() => { return i18n.__('rateEmotionRequired') })
                .isIn(['BAD', 'GOOD', 'EXCELLENT']).withMessage(() => { return i18n.__('WrongType') }),
            body('rateComment').optional().not().isEmpty().withMessage(() => { return i18n.__('rateCommentRequired') }),
            body('order').not().isEmpty().withMessage(() => { return i18n.__('orderRequired') })
        ];
        return validations;
    },
    async clientRateTrader(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            let order = await checkExistThenGet(validatedBody.order, Order, { deleted: false,/* status: "DELIVERED"*/ })

            if (validatedBody.rateEmotion == 'BAD') {
                validatedBody.traderRateValue = 1;
            } else if (validatedBody.rateEmotion == 'GOOD') {
                validatedBody.traderRateValue = 3;
            } else {
                validatedBody.traderRateValue = 5;
            }

            validatedBody.traderRateEmotion = validatedBody.rateEmotion;
            validatedBody.traderRateDate = new Date()
            if (validatedBody.rateComment) {
                validatedBody.traderRateComment = validatedBody.rateComment;
            }
            delete validatedBody.order;

            let updatedOrder = await Order.findByIdAndUpdate(order._id, validatedBody, { new: true }).populate(populateQuery);
            let trader = await User.findOne({ _id: order.trader });
            trader.totalRateCount = trader.totalRateCount + 1;
            trader.totalRate = trader.totalRate + validatedBody.traderRateValue;
            await trader.save();
            res.status(200).send({ order: updatedOrder });
        } catch (err) {
            next(err);
        }
    },
    async clientRateDriver(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            let order = await checkExistThenGet(validatedBody.order, Order, { deleted: false,/* status: "DELIVERED"*/ })

            if (validatedBody.rateEmotion == 'BAD') {
                validatedBody.driverRateValue = 1;
            } else if (validatedBody.rateEmotion == 'GOOD') {
                validatedBody.driverRateValue = 3;
            } else {
                validatedBody.driverRateValue = 5;
            }

            validatedBody.driverRateEmotion = validatedBody.rateEmotion;
            validatedBody.driverRateDate = new Date()
            if (validatedBody.rateComment) {
                validatedBody.driverRateComment = validatedBody.rateComment;
            }
            delete validatedBody.order;

            let updatedOrder = await Order.findByIdAndUpdate(order._id, validatedBody, { new: true }).populate(populateQuery);
            if (updatedOrder.driver) {
                let driver = await User.findOne({ _id: order.driver });
                driver.totalRateCount = driver.totalRateCount + 1;
                driver.totalRate = driver.totalRate + validatedBody.driverRateValue;
                await driver.save();
            }

            res.status(200).send({ order: updatedOrder });
        } catch (err) {
            next(err);
        }
    },

    async driverRateClient(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            let order = await checkExistThenGet(validatedBody.order, Order, { deleted: false,/* status: "DELIVERED"*/ })

            if (validatedBody.rateEmotion == 'BAD') {
                validatedBody.driverClientRateValue = 1;
            } else if (validatedBody.rateEmotion == 'GOOD') {
                validatedBody.driverClientRateValue = 3;
            } else {
                validatedBody.driverClientRateValue = 5;
            }

            validatedBody.driverClientRateEmotion = validatedBody.rateEmotion;
            validatedBody.driverClientRateDate = new Date()
            if (validatedBody.rateComment) {
                validatedBody.driverClientRateComment = validatedBody.rateComment;
            }
            delete validatedBody.order;

            let updatedOrder = await Order.findByIdAndUpdate(order._id, validatedBody, { new: true }).populate(populateQuery);
            let client = await User.findOne({ _id: order.user });
            client.totalRateCount = client.totalRateCount + 1;
            client.totalRate = client.totalRate + validatedBody.driverClientRateValue;
            await client.save();
            res.status(200).send({ order: updatedOrder });
        } catch (err) {
            next(err);
        }
    },

    async driverRateTrader(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            let order = await checkExistThenGet(validatedBody.order, Order, { deleted: false,/* status: "DELIVERED"*/ })

            if (validatedBody.rateEmotion == 'BAD') {
                validatedBody.driverTraderRateValue = 1;
            } else if (validatedBody.rateEmotion == 'GOOD') {
                validatedBody.driverTraderRateValue = 3;
            } else {
                validatedBody.driverTraderRateValue = 5;
            }

            validatedBody.driverTraderRateEmotion = validatedBody.rateEmotion;
            validatedBody.driverTraderRateDate = new Date()
            if (validatedBody.rateComment) {
                validatedBody.driverTraderRateComment = validatedBody.rateComment;
            }
            delete validatedBody.order;

            let updatedOrder = await Order.findByIdAndUpdate(order._id, validatedBody, { new: true }).populate(populateQuery);
            let trader = await User.findOne({ _id: order.trader });
            trader.totalRateCount = trader.totalRateCount + 1;
            trader.totalRate = trader.totalRate + validatedBody.driverTraderRateValue;
            await trader.save();
            res.status(200).send({ order: updatedOrder });
        } catch (err) {
            next(err);
        }
    },

    async traderRateDriver(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            let order = await checkExistThenGet(validatedBody.order, Order, { deleted: false,/* status: "DELIVERED"*/ })

            if (validatedBody.rateEmotion == 'BAD') {
                validatedBody.traderRateDriverValue = 1;
            } else if (validatedBody.rateEmotion == 'GOOD') {
                validatedBody.traderRateDriverValue = 3;
            } else {
                validatedBody.traderRateDriverValue = 5;
            }

            validatedBody.traderRateDriverEmotion = validatedBody.rateEmotion;
            validatedBody.traderRateDriverDate = new Date();
            if (validatedBody.rateComment) {
                validatedBody.traderRateDriverComment = validatedBody.rateComment;
            }
            delete validatedBody.order;

            let updatedOrder = await Order.findByIdAndUpdate(order._id, validatedBody, { new: true }).populate(populateQuery);

            if (updatedOrder.driver) {
                let driver = await User.findOne({ _id: order.driver });
                driver.totalRateCount = driver.totalRateCount + 1;
                driver.totalRate = driver.totalRate + validatedBody.traderRateDriverValue;
                await driver.save();
            }
            res.status(200).send({ order: updatedOrder });
        } catch (err) {
            next(err);
        }
    },

    async getTraderRates(req, res, next) {
        try {

            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { trader } = req.query;

            if (!trader) return next(new ApiError(404, i18n.__('traderRequired')));
            let query = { deleted: false, trader: trader, $or: [{ traderRateEmotion: { $ne: null } }, { driverTraderRateEmotion: { $ne: null } }] };

            let orders = await Order.find(query)
                // .select(['_id', 'user', 'traderRateValue', 'traderRateEmotion', 'traderRateComment'])
                .sort({ createdAt: -1 })
                .limit(limit).skip((page - 1) * limit)
                .populate(populateQuery);

            let ordersCount = await Order.count(query);
            const pageCount = Math.ceil(ordersCount / limit);
            res.send(new ApiResponse(orders, page, pageCount, limit, ordersCount, req));

        } catch (err) {
            next(err);
        }
    },


    populateQuery,

    ////////////////////////////////////Dues////////////////////////////////////////
    async traderGetSales(req, res, next) {
        try {
            let user;
            let { fromDate, toDate } = req.query;
            let page = +req.query.page || 1, limit = +req.query.limit || 20;


            if (req.user.type == 'ADMIN' || req.user.type == 'SUB_ADMIN') {
                if (!req.query.user) {
                    return next(new ApiError(403, ('specifiuserinquery')));
                } else {
                    user = req.query.user;
                    user = await checkExistThenGet(user, User, { deleted: false })
                }
            } else {
                user = req.user;
            }

            let query = { deleted: false, trader: +user.id, status: 'DELIVERED' };

            if (fromDate && !toDate) query.createdAt = { $gte: new Date(moment(fromDate).startOf('day')) };
            if (toDate && !fromDate) query.createdAt = { $lt: new Date(moment(toDate).endOf('day')) };
            if (fromDate && toDate) query.createdAt = { $gte: new Date(moment(fromDate).startOf('day')), $lt: new Date(moment(toDate).endOf('day')) };


            // let results = await Order.aggregate()
            //     .match(query)
            //     .group({
            //         _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            //         count: { $sum: 1 },
            //         totalDues: { $sum: { $cond: [{ $or:[{'$paymentMethod':{$ne:'CASH'} ,"$traderPayoffDues": false},{$and: [{ $eq: ["$traderPayoffDues", false] }, { $eq: ["$orderType", 'DELIVERY'] }]}] }, '$traderDues', 0] } },
            //         orders: { $push: '$$ROOT' }
            //     })
            let results = await Order.aggregate([
                { $match: query },
                {
                    $facet: {
                        data: [
                            { $sort: { '_id': -1 } },
                            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, orders: { $push: '$$ROOT' }/*, count: { $sum: 1 }*/ } },
                            { $skip: ((page - 1) * limit) },
                            { $limit: limit }
                        ],
                        pageInfo: [
                            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } } }
                        ]
                    },
                }
            ])
            // let total = Number(user.wallet);
            // for (let index = 0; index < results.length; index++) {
            //     total += results[index].totalDues;
            // }
            // res.send({ data: results/*, total: total*/ });
            // return ;
            let total = user.wallet;
            let data = results[0].data;
            let daysCount = results[0].pageInfo.length > 0 ? results[0].pageInfo.length : 0;
            let pageCount = Math.ceil(daysCount / limit);
            res.send(new ApiResponse(data, page, pageCount, limit, daysCount, req,{total}));

        } catch (err) {
            next(err);
        }
    },

    async getDriverSales(req, res, next) {
        try {
            let user;
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { fromDate, toDate } = req.query;

            if (req.user.type == 'ADMIN' || req.user.type == 'SUB_ADMIN') {
                if (!req.query.user) {
                    return next(new ApiError(403, ('specifiuserinquery')));
                } else {
                    user = req.query.user;
                    user = await checkExistThenGet(user, User, { deleted: false })
                }
            } else {
                user = req.user;
            }

            let query = { deleted: false, driver: +user.id, status: 'DELIVERED', orderType: 'DELIVERY' };
            if (fromDate && !toDate) query.createdAt = { $gte: new Date(moment(fromDate).startOf('day')) };
            if (toDate && !fromDate) query.createdAt = { $lt: new Date(moment(toDate).endOf('day')) };
            if (fromDate && toDate) query.createdAt = { $gte: new Date(moment(fromDate).startOf('day')), $lt: new Date(moment(toDate).endOf('day')) };


            let orders, ordersCount, pageCount;
            let data = await Order.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'trader',
                        foreignField: '_id',
                        as: 'tradersData'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $facet: {
                        data: [
                            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, orders: { $push: '$$ROOT' }/*, count: { $sum: 1 }*/ } },
                            { $sort: { '_id': -1 } },
                            { $skip: ((page - 1) * limit) },
                            { $limit: limit }
                        ],
                        pageInfo: [
                            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } } },
                        ]
                    },
                },
            ]);
            orders = data[0].data;
            ordersCount = data[0].pageInfo.length;
            pageCount = Math.ceil(ordersCount / limit);
            res.send(new ApiResponse(orders, page, pageCount, limit, ordersCount, req));
            
        } catch (err) {
            next(err);
        }
    },
    async getDriverSummery(req, res, next) {
        try {
            let user;
            let { fromDate, toDate } = req.query;

            if (req.user.type == 'ADMIN' || req.user.type == 'SUB_ADMIN') {
                if (!req.query.user) {
                    return next(new ApiError(403, ('specifiuserinquery')));
                } else {
                    user = req.query.user;
                    user = await checkExistThenGet(user, User, { deleted: false })
                }
            } else {
                user = req.user;
            }

            let query = { deleted: false, driver: +user.id, status: 'DELIVERED'/*, orderType: 'DELIVERY'*/ };
            if (fromDate && !toDate) query.createdAt = { $gte: new Date(moment(fromDate).startOf('day')) };
            if (toDate && !fromDate) query.createdAt = { $lt: new Date(moment(toDate).endOf('day')) };
            if (fromDate && toDate) query.createdAt = { $gte: new Date(moment(fromDate).startOf('day')), $lt: new Date(moment(toDate).endOf('day')) };


            let result = await Order.aggregate().match(query)
                                    .group({_id:null,
                                        totalCash: {
                                            '$sum': {
                                                '$cond': [
                                                    { '$eq': ['$paymentMethod', 'CASH']}, 
                                                    '$finalPrice', 
                                                    0
                                                ]
                                            }
                                        },
                                        // totalFreeTransport:{
                                        //     '$sum': {
                                        //         '$cond': [
                                        //             { '$eq': ['$type', 'CHARITY']}, 
                                        //             '$transportPrice', 
                                        //             0
                                        //         ]
                                        //     }
                                        // },
                                        totalFreeTransport:{
                                            '$sum': {
                                                '$cond': [
                                                    {  '$or':[{'$eq': ['$type', 'CHARITY']},{'$eq': ['$promoCodeOn', 'TRANSPORTATION']}]  }, 
                                                    '$transportPrice', 
                                                    0
                                                ]
                                            }
                                        },
                                        totalTransport:{
                                            '$sum': '$transportPrice'
                                        },
                                        


                                    });
            // result = {
            //     totalCash:0,
            //     totalFreeTransport:0,
            //     totalTransport:0,
            //     totalDepit:0,
            //     totalCredit:0,
            //     netAmmount:0

            // };
            result = (result.length > 0)? result[0]:{ totalCash:0,totalFreeTransport:0,totalTransport:0};
            result.totalDepit = user.walletSubtracted;
            result.totalCredit = user.walletAdded;
            result.netAmmount = user.wallet;


            delete result._id;

            res.status(200).send({result});
        } catch (err) {
            next(err);
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
            await Order.updateMany({ _id: { $in: validatedBody.ids }, deleted: false }, { deleted: true, deletedDate: new Date() })
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    }
}