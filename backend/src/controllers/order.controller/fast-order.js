import Order from "../../models/order.model/order.model.js";
import Product from '../../models/product.model/product.model.js';
import PromoCode from '../../models/promocode.model/promocode.model.js';
import User from '../../models/user.model/user.model.js';
import Region from '../../models/region.model/region.model.js';
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations, handleImg } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import moment from 'moment'
import notifyController from '../notif.controller/notif.controller.js';
import socketEvents from '../../socketEvents.js';
import Company from '../../models/company.model/company.model.js';
import { sendEmail, sendHtmlEmail, sendChangeOrderEmail } from '../../services/emailMessage.service.js';
import schedule from 'node-schedule';
import userController from "../user.controller/user.controller.js";
import orderController from "../order.controller/order.controller.js";
import Zone from "../../models/zone.model/zone.model.js";
import Message from '../../models/message.model/message.model.js'
import orderHelper from './helpers.js'

let populateQuery = [
    { path: 'user', model: 'user' },
    { path: 'driver', model: 'user' },
    { path: 'offers.driver', model: 'user' },
    { path: 'promoCode', model: 'promocode' }
];



const findAnotherDrivers = async (order, fastOrderSearchDistance /* in m */)=>{
    try {
        if ( order.driver || (order.status == 'REJECTED') ) {
            return ;
        }
        let jobName = `findAnotherDrivers-${order.id}`;
        let date = new Date().getTime() + 60000;
        date = new Date(date);
        let j = schedule.scheduleJob(jobName, date, async (fireDate) => {
            try {
                order = await checkExistThenGet(order.id, Order);
                if ( !(order.driver || (order.status == 'REJECTED')) ) {
                    await driversSearch(order, fastOrderSearchDistance);
                }
            } catch (error) {
                throw error;
            }
        }); 
    } catch (error) {
        console.log('findAnotherDrivers error ',error);
    }
}


const driversSearch = async (order, fastOrderSearchDistance /* in m */) => {
    try {
        let zones = [];
        // let busyDrivers = await Order.find({ deleted: false, status: { $in: ['DRIVER_ACCEPTED', 'PREPARED', 'SHIPPED'] } }).distinct('driver');
        // busyDrivers = busyDrivers.map((d) => { return +d });

        let rejectedDrivers = order.rejectedUsers.map((d) => { return +d });
        let sendedTo = order.sendedTo.map((d) => { return +d });

        let driverQuery = {
            'driver.deleted': false,
            'driver.online': true,
            'driver.activated': true,
            // 'driver.ajamTaxes': { $ne: null },
            'driver.status': 'ACCEPTED',
            // 'driver.type': 'DRIVER',

            'driver._id': { $nin: rejectedDrivers },
            'driver._id': { $nin: sendedTo }
            // 'driver._id': { $nin: busyDrivers }
            // $and: [{ 'driver._id': { $nin: busyDrivers } }, { 'driver._id': { $nin: rejectedDrivers } }]
        };
        zones = await Zone.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [+order.receiptOrder.long, +order.receiptOrder.lat]
                    },
                    distanceField: "distance",
                    spherical: true,
                    maxDistance: fastOrderSearchDistance,
                    query: { deleted: false, driver: { $ne: null } },
                    key: 'currentDriverLocation'
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
                $limit:5
            }
        ]);
       
        // let length = zones.length;

        // if (length == 0) { // to be updated
        //     console.log('no driver available in fast ');
        //     order = await Order.findByIdAndUpdate(order.id, { status: 'NOT_ASSIGN' }, { new: true }).populate(populateQuery);
        //     let description = {
        //         en: `We are sorry, we will not be able to fulfill your fast order currently.`,
        //         ar: ` ناسف لن نتمكن من تلبية طلبكم السريع حاليا`
        //     };

        //     await notifyController.create(order.user.id, order.user.id, description, order.id, 'CHANGE_ORDER_STATUS', order.id, order.status);
        //     notifyController.pushNotification(order.user.id, 'CHANGE_ORDER_STATUS', order.id, description);
        //     notificationNSP.to('room-' + order.user.id).emit(socketEvents.ChangeOrderStatus, { order });

        //     return;
        // }

        console.log('available ',zones.length);
        let sendedUsers = zones.map(z=> z.driver._id);

        if (sendedUsers.length > 0) {
            order.sendedTo.push(...sendedUsers);
            await Order.findByIdAndUpdate(order.id , {sendedTo : order.sendedTo });
        }

        

        //await Order.findByIdAndUpdate(order.id,{$push:{sendedTo:sendedUsers}});
        //console.log('sendedUsers pushed ',sendedUsers);
        let description = { ar: 'لديك طلب سريع جديد ', en: 'You have a new fast order' };
        zones.forEach(async (zone) => {
            console.log('driver fast ', zone.driver._id);
            notificationNSP.to('room-' + zone.driver._id).emit(socketEvents.NewFastOrder, { order: order });
            await notifyController.create(order.user.id, zone.driver._id, description, order.id, 'FAST_ORDER', order.id, order.status);
            notifyController.pushNotification(zone.driver._id, 'NEW_FAST_ORDER', order.id, description);
        });
        findAnotherDrivers(order,fastOrderSearchDistance);
    } catch (error) {
        throw error;
    }
}

let searchJob = async (order) => {
    try {
        let company = await Company.findOne({ deleted: false });
        let fastOrderSearchDistance  = company.fastOrderSearchDistance * 1000;
        let insideSearchTime = true;

        let jobName = `fast-order-${order.id}`;
        let date = new Date(order.createdAt).getTime() + company.fastOrderSearchTime;
        date = new Date(date);
        let j = schedule.scheduleJob(jobName, date, async (fireDate) => {
            try {
                console.log(jobName, ' fire date ', fireDate);
                let currentOrder = await checkExistThenGet(order.id, Order);
                
                insideSearchTime = false;

                if (!currentOrder.driver) {
                    let validatedBody = { status: 'REJECTED' };
                    let updatedOrder = await Order.findByIdAndUpdate(order.id, validatedBody, { new: true }).populate(populateQuery);
                    console.log('currentOrder.user.id ',updatedOrder.user.id);
                    notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });
                    // findDriver(updatedOrder);
                }
                orderHelper.cancelJob(`findAnotherDrivers-${order.id}`);
            } catch (error) {
                throw error;
            }
        });

        // while (insideSearchTime) {
        //     console.log( new Date() , insideSearchTime);
        //     if (!order.driver) {
        //         await driversSearch(order, fastOrderSearchDistance);
        //         await new Promise(resolve => setTimeout(resolve, 60000));
        //         order = await checkExistThenGet(order.id,Order,{populate:populateQuery});
        //     }
        // }
        // console.log('no more search ');
        await driversSearch(order, fastOrderSearchDistance);
    } catch (error) {
        console.log('error search driver ', error);
    }
}

const createMessage = async (order, sender, reciver/*,text*/, fastOrderAction) => {
    let messageData = {
        order: order,
        lastMessage: true,
        sender: sender,
        // message: {fastOrderActionText:text}, 
        reciver: { user: reciver },
        fastOrderAction,
        messageType: 'FAST'
    }
    let popQuery = [
        { path: 'sender', model: 'user' },
        { path: 'reciver.user', model: 'user' },
        { path: 'order', model: 'order' }
    ]
    let createdMessage = await Message.create(messageData);
    createdMessage = await Message.populate(createdMessage, popQuery);
    await Message.updateMany({ deleted: false, _id: { $ne: createdMessage.id }, order: order }, { $set: { lastMessage: false } });
    // messageController.handelNewMessageSocket(createdMessage);
    console.log('createdMessage.reciver.user.id ', createdMessage.reciver.user.id);
    chatNSP.to('room-' + createdMessage.reciver.user.id).emit(socketEvents.NewMessage, { message: createdMessage });
    console.log(' createdMessage.sender.id ', createdMessage.sender.id)
    chatNSP.to('room-' + createdMessage.sender.id).emit(socketEvents.NewMessage, { message: createdMessage });
}


export default {

    validateBody(isUpdate = false) {
        if (isUpdate) {
            return [
                body('notes').optional().not().isEmpty().withMessage(() => { return i18n.__('notesRequired') }),
                body('fastOrdersRange').optional().not().isEmpty().withMessage(() => { return i18n.__('fastOrdersRangeRequired') }),
                body('fastOrdersRange.from').optional().not().isEmpty().withMessage(() => { return i18n.__('fromFastOrdersRangeRequired') }),
                body('fastOrdersRange.to').optional().not().isEmpty().withMessage(() => { return i18n.__('toFastOrdersRangeRequired') }),

                body('orderDelivery').optional().not().isEmpty().withMessage(() => { return i18n.__('orderDeliveryRequired') }),
                body('orderDelivery.lat').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('orderDelivery.long').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('orderDelivery.address').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('orderDelivery.buildingNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('orderDelivery.addressName').optional().not().isEmpty().withMessage(() => { return i18n.__('addressNameRequired') }),
                body('orderDelivery.flatNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('orderDelivery.region').optional().not().isEmpty().withMessage(() => { return i18n.__('regionRequired') })
                    .custom(async (value) => {
                        await checkExistThenGet(value, Region, { deleted: false });
                        return true;
                    }),

                body('receiptOrder').optional().not().isEmpty().withMessage(() => { return i18n.__('receiptOrderRequired') }),
                body('receiptOrder.lat').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('receiptOrder.long').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('receiptOrder.address').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('receiptOrder.buildingNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('receiptOrder.addressName').optional().not().isEmpty().withMessage(() => { return i18n.__('addressNameRequired') }),
                body('receiptOrder.flatNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('receiptOrder.region').optional().not().isEmpty().withMessage(() => { return i18n.__('regionRequired') })
                    .custom(async (value) => {
                        await checkExistThenGet(value, Region, { deleted: false });
                        return true;
                    }),
                body('promoCode').optional().not().isEmpty().withMessage(() => { return i18n.__('promocodeRequired') })
                    .custom(async (val, { req }) => {
                        let currentDate = new Date();
                        let query = {
                            deleted: false,
                            startDate: { $lte: currentDate },
                            endDate: { $gte: currentDate },
                            $or: [{ usersType: 'ALL' }, { usersType: 'SPECIFIC', users: { $elemMatch: { $eq: req.user.id } } }]
                        };
                        let promoCode = await checkExistThenGet(val, PromoCode, query, i18n.__('promoCodeInvalid'));
                        let count = await Order.count({ deleted: false, user: req.user.id, promoCode: promoCode.id });
                        if (count >= promoCode.numberOfUse) {
                            throw new Error(i18n.__('ExccedPromoCodeNumberOuse'));
                        }
                        return true;
                    })

            ];

        } else {
            return [
                body('notes').not().isEmpty().withMessage(() => { return i18n.__('notesRequired') }),
                body('fastOrdersRange').not().isEmpty().withMessage(() => { return i18n.__('fastOrdersRangeRequired') }),
                body('fastOrdersRange.from').not().isEmpty().withMessage(() => { return i18n.__('fromFastOrdersRangeRequired') }),
                body('fastOrdersRange.to').not().isEmpty().withMessage(() => { return i18n.__('toFastOrdersRangeRequired') }),

                body('orderDelivery').not().isEmpty().withMessage(() => { return i18n.__('orderDeliveryRequired') }),
                body('orderDelivery.lat').not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('orderDelivery.long').not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('orderDelivery.address').not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('orderDelivery.buildingNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('orderDelivery.addressName').optional().not().isEmpty().withMessage(() => { return i18n.__('addressNameRequired') }),
                body('orderDelivery.flatNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('orderDelivery.region').optional().not().isEmpty().withMessage(() => { return i18n.__('regionRequired') })
                    .custom(async (value) => {
                        await checkExistThenGet(value, Region, { deleted: false });
                        return true;
                    }),

                body('receiptOrder').not().isEmpty().withMessage(() => { return i18n.__('receiptOrderRequired') }),
                body('receiptOrder.lat').not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('receiptOrder.long').not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('receiptOrder.address').not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('receiptOrder.buildingNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('receiptOrder.addressName').optional().not().isEmpty().withMessage(() => { return i18n.__('addressNameRequired') }),
                body('receiptOrder.flatNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
                body('receiptOrder.region').optional().not().isEmpty().withMessage(() => { return i18n.__('regionRequired') })
                    .custom(async (value) => {
                        await checkExistThenGet(value, Region, { deleted: false });
                        return true;
                    }),
                body('promoCode').optional().not().isEmpty().withMessage(() => { return i18n.__('promocodeRequired') })
                    .custom(async (val, { req }) => {
                        let currentDate = new Date();
                        let query = {
                            deleted: false,
                            startDate: { $lte: currentDate },
                            endDate: { $gte: currentDate },
                            $or: [{ usersType: 'ALL' }, { usersType: 'SPECIFIC', users: { $elemMatch: { $eq: req.user.id } } }]
                        };
                        let promoCode = await checkExistThenGet(val, PromoCode, query, i18n.__('promoCodeInvalid'));
                        let count = await Order.count({ deleted: false, user: req.user.id, promoCode: promoCode.id });
                        if (count >= promoCode.numberOfUse) {
                            throw new Error(i18n.__('ExccedPromoCodeNumberOuse'));
                        }
                        return true;
                    })

            ];
        }
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            let validatedBody = checkValidations(req);
            validatedBody.type = 'FAST';
            validatedBody.orderType = 'DELIVERY';
            validatedBody.paymentMethod = 'CASH';
            validatedBody.orderNumber = '' + (new Date()).getTime();
            validatedBody.user = user.id;
            validatedBody.fastOrderExpired = false;

            // let {trader,products} = await checkAvailability(validatedBody.products);
            // validatedBody.products = products;
            // validatedBody.trader = trader.id;
            // validatedBody.ajamTaxes = Number(trader.ajamTaxes) || 5;
            // validatedBody.price = await calculatePrice(validatedBody.products)
            // validatedBody = await getTotalPrice(validatedBody); // get total price;


            // validatedBody.finalPrice = validatedBody.totalPrice;

            // if (validatedBody.finalPrice < trader.minimumOrderPrice ) {
            //     return next(new ApiError(400,i18n.__('minimumOrderPriceInvalid')))
            // }

            /////////////////////////// Taxes ///////////////////////////////
            let company = await Company.findOne({ deleted: false }).populate([{ path: 'charity', model: 'charity' }]);
            company = company.toJSON();

            validatedBody.fastOrderFees = Number(company.fastOrderFees);
            validatedBody.finalPrice = validatedBody.fastOrderFees;


            // if (!trader.productsIncludeTaxes) {
            //     validatedBody.taxes = Number(company.taxes);
            // } else {
            //     validatedBody.taxes = 0;
            // }
            // validatedBody.finalPrice  = validatedBody.finalPrice + ((validatedBody.totalPrice * 100) *  validatedBody.taxes)
            //////////////////////////Treansportation Price////////////////////////////////
            // if ((validatedBody.paymentMethod == 'WALLET') && (req.user.wallet < validatedBody.totalPrice)) {
            //     return next(new ApiError(400, i18n.__('walletInvalid')));
            // }
            // if ( validatedBody.type == 'CHARITY') {
            //     if (validatedBody.orderType == 'FROM_STORE') {
            //         return next(new ApiError(400,i18n.__('invalidOrderType')));
            //     }
            //     if (!company.charity) {
            //         return next(new ApiError(400,i18n.__('noCharityAvailable')));
            //     }
            //     validatedBody.charity = company.charity.id;
            //     delete company.charity._id;
            //     validatedBody.charityDetails = company.charity; 
            // }

            // if (validatedBody.orderType == 'DELIVERY') {
            //     if (!(validatedBody.durationDelivery && validatedBody.deliveryPricePerSecond && validatedBody.transportPrice)) {
            //         return next(new ApiError(400,i18n.__('invalidTransportPrice')));   
            //     }
            //     if (validatedBody.type != 'CHARITY') {
            //         validatedBody.finalPrice = validatedBody.finalPrice + validatedBody.transportPrice;  
            //     }
            // } else {
            //     validatedBody.transportPrice = 0;
            // }

            // if (validatedBody.orderType == 'FROM_STORE') {
            //     validatedBody.receiptFromStoreFees = company.receiptFromStoreFees;
            //     validatedBody.finalPrice = validatedBody.finalPrice + validatedBody.receiptFromStoreFees; 
            //     validatedBody.driverDues = 0; 
            // }else {
            //     validatedBody.driverDues = validatedBody.transportPrice;
            // }

            // let paymentMethods = {'DIGITAL':'digital','WALLET':'wallet','CREDIT':'credit','MOBILE':'mobile'}
            // if (validatedBody.paymentMethod != 'CASH') {
            //     let key = paymentMethods[validatedBody.paymentMethod]+ 'PaymentFees';
            //     validatedBody.ePaymentFees = company[key];
            //     validatedBody.finalPrice = validatedBody.finalPrice + validatedBody.ePaymentFees;  
            // }


            //////////////////////////////////////////////////////////////////trader.type == 'INSTITUTION' &&
            // if ( !trader.productsIncludeTaxes) { // price not include taxes
            //     let traderPrice = validatedBody.totalPrice;
            //     validatedBody.ajamDues = Number((traderPrice * (Number(validatedBody.ajamTaxes) / 100)).toFixed(2));
            //     validatedBody.traderDues = (traderPrice- Number(validatedBody.ajamDues) ) + ((validatedBody.totalPrice / 100) * validatedBody.taxes);
            // }
            // else { // price include taxes
            //     let taxes = Number(company.taxes);
            //     let traderPrice = validatedBody.totalPrice - ((validatedBody.totalPrice / 100) * taxes);
            //     validatedBody.ajamDues = (traderPrice * (Number(validatedBody.ajamTaxes) / 100)).toFixed(2);
            //     validatedBody.traderDues = validatedBody.totalPrice - Number(validatedBody.ajamDues) ;
            // }

            /////////////////////////////////////////////////////////////////////////////////////////////
            // validatedBody.lastActionDate = new Date();
            // console.log(validatedBody);
            let order = await Order.create(validatedBody);

            order.orderNumber = order.orderNumber + order.id;
            await order.save();

            // if (validatedBody.paymentMethod == 'DIGITAL') {
            //     getCheckoutId(req, res, next, order, 'VISA');
            // } else {
            //     res.status(200).send(order);
            // }

            res.status(200).send(order);

            order = await Order.populate(order, populateQuery);

            await searchJob(order);

            // await notifyTraders(order,company.fastOrderSearchDistance * 1000,company.fastOrderSearchTime  );
            ///////////////////////////////////////////

            // if (validatedBody.paymentMethod == 'WALLET') {
            //     user.wallet = user.wallet - order.finalPrice;
            //     await user.save();
            //     notificationNSP.to('room-' + user.id).emit(socketEvents.NewUser, { user: user });
            // }
            //////////////////////////////////////////
            // traderService(order,company,order.createdAt);
            // let description = { ar: 'لديك طلب جديد ',  en: 'You have a new Order'};
            // await notifyController.create(req.user.id, order.trader.id, description, order.id, 'ORDER', order.id);
            // notifyController.pushNotification(order.trader.id, 'ORDER', order.id, description);
            // notificationNSP.to('room-' + order.trader.id).emit(socketEvents.NewOrder, { order: order });
            // orderController.traderOrdersCount(order.trader.id);

            ////////////////////////////////////////////////////////////////////////////////////////////
            orderHelper.clientOrdersCount(req.user.id);

            ////////////////////////////////////////////////////////////////////////////////////////////
            // await sendHtmlEmail(req.user.email, order.orderNumber, order.products.length, order.finalPrice, order.transportPrice, order.taxes, order.userAddress.address||'', order.userAddress.addressName||'', order.userAddress.buildingNumber||'', order.userAddress.flatNumber||'', order.finalPrice);

        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { id } = req.params;
            let order = await checkExistThenGet(id, Order, { deleted: false, user: user.id }, i18n.__('notAllowToCancel'));

            let validatedBody = checkValidations(req);
            let updatedproduct = await Order.findByIdAndUpdate(id, { ...validatedBody/*, ...data*/ }, { new: true }).populate(populateQuery)

            updatedproduct = Product.schema.methods.toJSONLocalizedOnly(updatedproduct, i18n.getLocale());

            res.status(200).send(updatedproduct);
        } catch (error) {
            next(error);
        }
    },

    async canceled(req, res, next) {
        try {
            let user = req.user;
            let { id } = req.params;
            let order = await checkExistThenGet(id, Order, { deleted: false, user: user.id, status: 'WAITING' }, i18n.__('notAllowToCancel'));

            order.status = 'CLIENT_CANCELED';
            order.clientCancelDate = new Date();

            await order.save();
            res.status(200).send(order);

            if (order.driver) {
                let description = { ar: `تم الغاء الطلب من قبل ${req.user.name}  `, en: `Your order has been canceled from ${req.user.name} ` };
                await notifyController.create(user.id, order.driver, description, order.id, 'FAST_ORDER', order.id, 'CLIENT_CANCELED');
                notifyController.pushNotification(order.driver, 'FAST_ORDER', order.id, description);
                notificationNSP.to('room-' + order.driver).emit(socketEvents.ChangeOrderStatus, { order: order });
            }
        } catch (err) {

            next(err);
        }
    },

    ///////////////////////////// Driver ///////////////////////////////

    validateDriverAddOffer() {
        return [
            body('transportPrice').not().isEmpty().withMessage(() => { return i18n.__('transportPriceRequired') }),
            body('time').not().isEmpty().withMessage(() => { return i18n.__('timeRequired') })
        ];
    },

    async driverAddOffer(req, res, next) {
        try {
            let user = req.user;
            let validatedBody = checkValidations(req);
            let { id } = req.params;
            let order = await checkExistThenGet(id, Order, { type: "FAST", deleted: false });
            if (order.driver) {
                return next(new ApiError(400, i18n.__('orderGone')));
            }
            if (order.fastOrderExpired) {
                return next(new ApiError(400, i18n.__('fastOrderExpired')));
            }

            let length = order.offers.length;
            for (let index = 0; index < length; index++) {
                if (order.offers[index].driver == user.id) {
                    return next(new ApiError(400, i18n.__('offerExist')));
                }
            }

            validatedBody.driver = user.id;
            let updatedOrder = await Order.findByIdAndUpdate(order._id, { $push: { offers: validatedBody } }, { new: true })
                .populate(populateQuery);

            res.status(200).send({ order: updatedOrder });
            notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.NewOffer, { offer: validatedBody });

        } catch (error) {
            next(error);
        }
    },

    async driverRejectOffer(req, res, next) {
        try {
            let user = req.user;
            let { id } = req.params;
            let order = await checkExistThenGet(id, Order, { type: "FAST", deleted: false });
            if (order.driver) {
                return next(new ApiError(400, i18n.__('orderGone')));
            }
            if (order.fastOrderExpired) {
                return next(new ApiError(400, i18n.__('fastOrderExpired')));
            }

            let updatedOrder = await Order.findByIdAndUpdate(order._id, { $push: { rejectedUsers: user.id } }, { new: true })
                .populate(populateQuery);
            res.status(200).send({ order: updatedOrder });
        } catch (error) {
            next(error);
        }
    },

    ///////////////////////////// Client ///////////////////////////////

    async userRejectOffer(req, res, next) {
        try {
            let { id, driverId } = req.params;
            let order = await checkExistThenGet(id, Order, {
                type: "FAST",
                deleted: false,
                offers: { $elemMatch: { driver: driverId, status: 'WAITING' } }
            });
            if (order.driver) {
                return next(new ApiError(400, i18n.__('attachedToDriver')));
            }
            let validateBody = { $set: { 'offers.$.status': 'REJECTED' } };
            let updatedOrder = await Order.findOneAndUpdate({ _id: id, offers: { $elemMatch: { driver: driverId } } }, validateBody, { new: true })
                .populate(populateQuery);


            res.status(200).send({ order: updatedOrder });
            // let length = updatedOrder.offers.length;
            // let applyDriversSearch = true;
            // for (let index = 0; index < length; index++) {
            //     if (updatedOrder.offers[index].status == 'WAITING') {
            //         applyDriversSearch = false;
            //         break;
            //     }
            // }
            // if (applyDriversSearch) {
            //     await driversSearch(updatedOrder);
            // }

        } catch (error) {
            next(error);
        }
    },

    async userAcceptOffer(req, res, next) {
        try {
            let { id, driverId } = req.params;
            let order = await checkExistThenGet(id, Order, { type: "FAST", deleted: false, 'offers.driver': driverId });
            let driverData = await checkExistThenGet(driverId, User, { deleted: false });
            let company = await Company.findOne({ deleted: false }).populate([{ path: 'charity', model: 'charity' }]);

            if (order.driver) {
                return next(new ApiError(400, i18n.__('attachedToDriver')));
            }
            let transportPrice, transportTime;
            let length = order.offers.length;
            for (let index = 0; index < length; index++) {
                if (order.offers[index].driver == driverId) {
                    transportPrice = order.offers[index].transportPrice;
                    transportTime = order.offers[index].time;
                    break;
                }
            }

            let transportationTaxes = company.transportationTaxes;
            let transportationTaxesValue = ((transportPrice / 100 ) *  transportationTaxes).toFixed(2);
            transportationTaxesValue = Number(transportationTaxesValue);


            let ajamTaxesFromDriver = driverData.driverFastOrderFees || 10;
            let ajamDuesFromDriver = ((transportPrice / 100) * ajamTaxesFromDriver);
            let driverDues = transportPrice - ajamDuesFromDriver;

            ajamDuesFromDriver = ajamDuesFromDriver + order.fastOrderFees + transportationTaxesValue ;

            let validateBody = {
                $set: { 'offers.$.status': 'ACCEPTED' },
                driver: driverId,
                transportPrice: transportPrice,
                driverDues,
                ajamDuesFromDriver,
                ajamTaxesFromDriver , 
                finalPrice: order.finalPrice + transportPrice + transportationTaxesValue,
                time: transportTime,
                transportationTaxes,
                transportationTaxesValue
            };
            let updatedOrder = await Order.findOneAndUpdate({ _id: id, offers: { $elemMatch: { driver: driverId } } }, validateBody, { new: true })
                .populate(populateQuery);
            res.status(200).send({ order: updatedOrder });

            let description = { ar: `تم قبول عرضك علي الطلب \n `+ updatedOrder.orderNumber, en: `Your offer has been confirmed \n ${order.orderNumber} ` };
            await notifyController.create(req.user.id, updatedOrder.driver.id, description, updatedOrder.id, 'FAST_ORDER', updatedOrder.id,'ACCEPTED');
            notifyController.pushNotification(updatedOrder.driver.id, 'FAST_ORDER', updatedOrder.id, description);
            

        } catch (error) {
            next(error);
        }
    },

    async userConfirmOrder(req, res, next) {
        try {
            let user = req.user;
            let { id } = req.params;
            let order = await checkExistThenGet(id, Order, { type: "FAST", deleted: false, status: 'WAITING', user: user.id });
            let updatedOrder = await Order.findByIdAndUpdate(id, { status: 'ACCEPTED', acceptedDate: new Date() }, { new: true }).populate(populateQuery);
            updatedOrder = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send({ order: updatedOrder });


            let description = { ar: `تم تاكيد الطلب \n ${order.orderNumber}`, en: `order confirmed \n ${order.orderNumber} ` };
            notifyController.pushNotification(updatedOrder.driver.id, 'FAST_ORDER', updatedOrder.id, description);
            notificationNSP.to('room-' + updatedOrder.driver.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });

            // await notifyController.create(req.user.id, updatedOrder.driver.id, description, updatedOrder.id, 'CHANGE_ORDER_STATUS', updatedOrder.id,updatedOrder.status);
            // let messageText = {ar:'بدء الرحلة',en:'Start trip'};

            await createMessage(updatedOrder.id, user.id, updatedOrder.driver.id/*,messageText*/, 'CONFIRM_ORDER');
        } catch (error) {
            //console.log(error);
            next(error);
        }
    },

    ////////////////////////////////////////////////////////////////////

    async startTrip(req, res, next) {
        try {
            let user = req.user;
            let { id } = req.params;
            let order = await checkExistThenGet(id, Order, { type: "FAST", deleted: false, status: 'ACCEPTED', driver: user.id });
            let updatedOrder = await Order.findByIdAndUpdate(id, { status: 'PREPARED', prepareDate: new Date() }, { new: true }).populate(populateQuery);
            updatedOrder = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send({ order: updatedOrder });


            let description = { ar: `تم بدء الرحلة ${order.orderNumber}`, en: `Trip started \n ${order.orderNumber}` };
            notifyController.pushNotification(updatedOrder.user.id, 'FAST_ORDER', updatedOrder.id, description);
            notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });

            let notifi = { ar: `${req.user.name} في الطريف `, en: `${req.user.name} on the way` };
            await notifyController.create(req.user.id, updatedOrder.user.id, notifi, updatedOrder.id, 'FAST_ORDER', updatedOrder.id,updatedOrder.status);
            // let messageText = {ar:'بدء الرحلة',en:'Start trip'};

            await createMessage(updatedOrder.id, user.id, updatedOrder.user.id/*,messageText*/, 'STARTTRIP');
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    async call(req, res, next) {
        try {
            let user = req.user;
            let { id } = req.params;
            let order = await checkExistThenGet(id, Order, { populate: populateQuery, type: "FAST", deleted: false, driver: user.id });
            order = Order.schema.methods.toJSONLocalizedOnly(order, i18n.getLocale());
            await createMessage(order.id, user.id, order.user.id, 'CALL');
            res.status(200).send({ order });
        } catch (error) {
            next(error);
        }
    },

    validateCreateInvoice() {
        return [
            body('price').not().isEmpty().withMessage(() => { return i18n.__('priceRequired') })
                .isInt().withMessage(() => { return i18n.__('numberRequired') })
        ];
    },

    async createInvoice(req, res, next) {
        try {
            let user = req.user;
            let { id } = req.params;
            let validatedBody = checkValidations(req);
            let order = await checkExistThenGet(id, Order, { type: "FAST",price:null, deleted: false, status: 'PREPARED', driver: user.id });

            validatedBody.finalPrice = Number(order.finalPrice) + Number(validatedBody.price);
            let updatedOrder = await Order.findByIdAndUpdate(id, validatedBody, { new: true }).populate(populateQuery);
            updatedOrder = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send({ order: updatedOrder });

            let description = { ar: `تم اصدار الفاتورة ${order.orderNumber}`, en: `Invoice issued \n ${order.orderNumber}` };
            notifyController.pushNotification(updatedOrder.user.id, 'FAST_ORDER', updatedOrder.id, description);
            notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });
            await createMessage(updatedOrder.id, user.id, updatedOrder.user.id/*,messageText*/, 'CREATE_INVOICE');
        } catch (error) {
            next(error);
        }
    },


    async addInvoiceImage(req, res, next) {
        try {
            let { id } = req.params;
            let user = req.user;
            let order = await checkExistThenGet(id, Order, { deleted: false, driver: user.id });

            let updateQuery = {};
            if (req.file) {
                updateQuery.invoiceImage = handleImg(req, { attributeName: 'invoiceImage', isUpdate: false });
            } else {
                return next(new ApiError(404, i18n.__('invoiceImageRequired')));
            }

            let updatedOrder = await Order.findByIdAndUpdate(id, updateQuery, { new: true }).populate(populateQuery);
            order = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send({ order });

            let description = { ar: `تم ارفاق صورة الفاتورة \n ${order.orderNumber} `, en: `Order invoice image added \n ${order.orderNumber}` };
            notifyController.pushNotification(updatedOrder.user.id, 'FAST_ORDER', updatedOrder.id, description);
            notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });

            await createMessage(updatedOrder.id, user.id, updatedOrder.user.id, 'INVOICE_IMAGE');

        } catch (error) {
            next(error);
        }
    },

    async delivered(req, res, next) {
        try {
            let user = req.user;
            let { id } = req.params;
            let order = await checkExistThenGet(id, Order, { type: "FAST", deleted: false, status: 'PREPARED', driver: user.id });
            let updatedOrder = await Order.findByIdAndUpdate(id, { status: 'SHIPPED', shippedDate: new Date() }, { new: true }).populate(populateQuery);
            updatedOrder = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send({ order: updatedOrder });


            let description = { ar: `تم الوصول الي موقع تسليم الطلب ${order.orderNumber}`, en: `Order delivered to the location \n ${order.orderNumber}` };
            await notifyController.create(req.user.id, updatedOrder.user.id, description, updatedOrder.id, 'FAST_ORDER', updatedOrder.id,updatedOrder.status);
            
            notifyController.pushNotification(updatedOrder.user.id, 'FAST_ORDER', updatedOrder.id, description);
            notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });

            await createMessage(updatedOrder.id, user.id, updatedOrder.user.id, 'DELIVERED');
        } catch (error) {
            console.log(error);
            next(error);
        }
    },

    async deliveredConfirm(req, res, next) {
        try {
            let user = req.user;
            let { id } = req.params;
            let order = await checkExistThenGet(id, Order, { type: "FAST", deleted: false, status: 'SHIPPED', user: user.id });
            let updatedOrder = await Order.findByIdAndUpdate(id, { status: 'DELIVERED', deliveredDate: new Date() }, { new: true }).populate(populateQuery);

            let driver = updatedOrder.driver;
            let updateQuery =  { wallet: driver.wallet - updatedOrder.ajamDuesFromDriver };
            await User.findByIdAndUpdate(driver.id, updateQuery);
            userController.updateUserSocket(driver.id);

            updatedOrder = Order.schema.methods.toJSONLocalizedOnly(updatedOrder, i18n.getLocale());
            res.status(200).send({ order: updatedOrder });


            let description = { ar: `تم تاكيد استلام الطلب ${order.orderNumber}`, en: `Order delivered confirmed \n ${order.orderNumber}` };
            notifyController.pushNotification(updatedOrder.driver.id, 'FAST_ORDER', updatedOrder.id, description);
            notificationNSP.to('room-' + updatedOrder.driver.id).emit(socketEvents.ChangeOrderStatus, { order: updatedOrder });

            await createMessage(updatedOrder.id, user.id, updatedOrder.driver.id, 'DELIVERED_CONFIRMED');

            notificationNSP.to('room-' + updatedOrder.driver.id).emit(socketEvents.NewRate, { order: updatedOrder });
            notificationNSP.to('room-' + updatedOrder.user.id).emit(socketEvents.NewRate, { order: updatedOrder });

        } catch (error) {
            console.log(error);
            next(error);
        }
    }
}