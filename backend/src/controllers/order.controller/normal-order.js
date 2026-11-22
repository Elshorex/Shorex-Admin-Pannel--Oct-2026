import Order from "../../models/order.model/order.model.js";
import Product from '../../models/product.model/product.model.js';
import Address from '../../models/address.model/address.model.js';
import PromoCode from '../../models/promocode.model/promocode.model.js';
import User from '../../models/user.model/user.model.js';
import Region from '../../models/region.model/region.model.js';
import Notification from '../../models/notif.model/notif.model.js';
import CreditCard from '../../models/credit.model/credit.model.js';
import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations, createPromise } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import moment from 'moment'
import notifyController from '../notif.controller/notif.controller.js';
import socketEvents from '../../socketEvents.js';
import { generateVerifyCode } from '../../services/generator-code-service.js'
import Company from '../../models/company.model/company.model.js';
import config from '../../config.js';
import { sendEmail, sendHtmlEmail, sendChangeOrderEmail } from '../../services/emailMessage.service.js';
import { duration_time, distance } from '../../calculateDistance.js'
import schedule from 'node-schedule';
import https from 'https';
import querystring from 'querystring';
import userController from "../user.controller/user.controller.js";
import orderController from "../order.controller/order.controller.js";
import Zone from "../../models/zone.model/zone.model.js";
import orderHelper from './helpers.js';
import PaymentTransaction from '../payment.controller/payment.controller.js'
import promocodeController from "../promocode.controller/promocode.controller.js";
import pointsController from "../wallet-transactions.controller/wallet-transactions.controller.js";

let populateQuery = [
    { path: 'user', model: 'user' },
    { path: 'driver', model: 'user' },
    { path: 'trader', model: 'user' },
    { path: 'products.product', model: 'product', populate: [{ path: 'trader', model: 'user' }, { path: 'productCategory', model: 'productCategory' }] },
    { path: 'address', model: 'address', populate: [{ path: 'city', model: 'city', populate: [{ path: 'country', model: 'country' }] }] },
    { path: 'promoCode', model: 'promocode' },
    { path: 'branch', model: 'user' }
];

let formatProductsArray = async (list,language = 'ar') => {
    let trader;
    let products = [];
    for (let index = 0; index < list.length; index++) {
        let product = await checkExistThenGet(list[index].product, Product, { deleted: false });
        if (trader && (trader != product.trader)) {
            throw new ApiError(400, 'Products must be from one store only !');
        } else {
            trader = product.trader;
        }
        if (!product.active) {
            throw new ApiError(400, product.name[language] + ' ' +  i18n.__('productNotActive'));
        }
        let singleProduct = list[index];
        singleProduct.price = product.price;
        singleProduct.productData = product;

        if (singleProduct.size) {
            singleProduct.size = orderHelper.findAdditionProperties(product, 'sizes', singleProduct.size);
            if (singleProduct.size.price) {
                singleProduct.price = singleProduct.size.price ; //+ singleProduct.price  
            }
        }
        if (singleProduct.volum) {
            singleProduct.volum = orderHelper.findAdditionProperties(product, 'volums', singleProduct.volum);
            if (singleProduct.volum.price) {
                singleProduct.price = singleProduct.volum.price ; // singleProduct.price ;
            }
        }
        if (singleProduct.color) {
            singleProduct.color = orderHelper.findAdditionProperties(product, 'colors', singleProduct.color);
            if (singleProduct.color.price) {
                singleProduct.price = singleProduct.price + singleProduct.color.price;
            }
        }
        
        if (singleProduct.test) {
            singleProduct.test = orderHelper.findAdditionProperties(product, 'tests', singleProduct.test);
            if (singleProduct.test.price) {
                singleProduct.price = singleProduct.price + singleProduct.test.price;
            }
        }
        if (singleProduct.otherProperty) {
            singleProduct.otherProperty = orderHelper.findOtherAdditionProperties(product, singleProduct.otherProperty)
            let otherLength = singleProduct.otherProperty.length
            for (let j = 0; j < otherLength; j++) {
                let properties = singleProduct.otherProperty[j].properties
                let otherArrayLength = properties.length;
                for (let p = 0; p < otherArrayLength; p++) {
                    if (properties[p].price) {
                        singleProduct.price = singleProduct.price + properties[p].price;
                    }
                }
            }
        }

        if (singleProduct.buyOneGetOne) {
            singleProduct.offer = 100;
        } else if (singleProduct.buyOneGet50Another) {
            singleProduct.offer = 50;
        } else {
            if (product.offer && (product.offer > 0) && (orderHelper.stillOfferExist(product)) ) {
                singleProduct.offer = product.offer;
            } else {
                singleProduct.offer = 0;
            }
        }

        singleProduct.priceAfterOffer = Number((singleProduct.price - (singleProduct.price * (singleProduct.offer / 100.0))).toFixed(3))
        products.push(singleProduct);
    }
    trader = await User.findById(trader);
    products[0].traderData = trader;
    return { products, trader };
}


let calculateTotalPrice = async (validateBody,promoCode) => {
    if (validateBody.promoCode && (promoCode.promoCodeOn != 'TRANSPORTATION')) {
        let priceBeforeDiscount;
        if (promoCode.promoCodeType == 'RATIO') {
            priceBeforeDiscount = Number(validateBody.price) ;

            if (promoCode.products.length > 0) {
                validateBody.discountValue = orderHelper.applyProductsPromo(validateBody,promoCode);
            }
            else if (promoCode.categories.length > 0) {
                validateBody.discountValue = orderHelper.applyCategoriesPromo(validateBody,promoCode);
            }
            else if (promoCode.institutions.length > 0) {
                validateBody.discountValue = orderHelper.applyInstitutionsPromo(validateBody,promoCode);
            }
            else {
                validateBody.discountValue = priceBeforeDiscount * (promoCode.discount / 100);
                if (promoCode.maxAmount && (validateBody.discountValue > promoCode.maxAmount)) {
                    validateBody.discountValue = promoCode.maxAmount;
                }
            }
           
            validateBody.totalPrice = priceBeforeDiscount - Number(validateBody.discountValue);
            validateBody.totalPrice = (validateBody.totalPrice < 0) ? 0 : validateBody.totalPrice.toFixed(3);
        
        } else {
            priceBeforeDiscount = Number(validateBody.price);
            if (promoCode.products.length > 0) {
                validateBody.discountValue = orderHelper.applyProductsPromo(validateBody,promoCode);
            }
            else if (promoCode.categories.length > 0) {
                validateBody.discountValue = orderHelper.applyCategoriesPromo(validateBody,promoCode);
            }
            else if (promoCode.institutions.length > 0) {
                validateBody.discountValue = orderHelper.applyInstitutionsPromo(validateBody,promoCode);
            }
            else {
                validateBody.discountValue = (((priceBeforeDiscount - promoCode.discount) > 0) ? promoCode.discount : priceBeforeDiscount);
            }
            validateBody.totalPrice = Number(priceBeforeDiscount - Number(validateBody.discountValue));
            validateBody.totalPrice = (validateBody.totalPrice < 0) ? 0 : validateBody.totalPrice.toFixed(3);
        }

    } else {
        validateBody.totalPrice = validateBody.price; 
    }
    validateBody.totalPrice = Number(validateBody.totalPrice) ;
    return validateBody;
}


/////////////////////////////////////////////////////////////////////////

const traderService = async (order, company, assignDate) => {
    try {
        console.log('ass ', assignDate);
        let date = (new Date(assignDate)).getTime();
        console.log(date);
        console.log(company.traderWaitingTime);
        date = date + company.traderWaitingTime;
        console.log(date);

        date = new Date(date);
        let jobName = 'trader-order-' + order.id;
        //let currentOrder = await checkExistThenGet(order.id, Order, { populate: populateQuery });
        console.log('trader service will fire on  ',date);
        let j = schedule.scheduleJob(jobName, date, async (fireDate) => {
            try {
                console.log(jobName, ' fire date ', fireDate);
                let currentOrder = await checkExistThenGet(order.id, Order);
                if (currentOrder.status == 'WAITING') {
                    let updatedOrder = await Order.findByIdAndUpdate(order.id, { traderNotResponse: true }, { new: true }).populate(populateQuery);
                    notificationNSP.to('room-' + updatedOrder.trader.id).emit(socketEvents.OrderExpired, { order: updatedOrder });
                    await orderHelper.TraderNotResponseCount();
                }
            } catch (error) {
                throw error;
            }
        })
    } catch (error) {
        throw error;
    }
}

/////////////////////////////////////////////////////////////////////////

let orderConfirmation = async (order,company,user) => {
    console.log('bbbbbbbbbbb ',order.trader , order.traderAssignDate);
    company = company ? company : await Company.findOne({deleted:false});
    // traderService(order, company, order.traderAssignDate);
    let description = { ar:  '  لديك طلب جديد \n' +`${order.orderNumber}`, en: `You have a new Order \n ${order.orderNumber}` };
    await notifyController.create(user.id, order.trader.id, description, order.id, 'ORDER', order.id,order.status);
    notifyController.pushNotification(order.trader.id, 'ORDER', order.id, description);
    notificationNSP.to('room-' + order.trader.id).emit(socketEvents.NewOrder, { order: order });
    orderHelper.traderOrdersCount(order.trader.id);
    orderHelper.clientOrdersCount(user.id);
    // await sendHtmlEmail(user.email, order.orderNumber, order.products.length, order.finalPrice, order.transportPrice, order.taxes, order.userAddress.address||'', order.userAddress.addressName||'', order.userAddress.buildingNumber||'', order.userAddress.flatNumber||'', order.finalPrice);
}

////////////////////////////////////////////////////////////////////////////
export default {


    async create(req, res, next) {
        try {
            console.log(' bb ',req.body);
            let user = req.user;
            let promoCode = req.promoCode ? req.promoCode : null;

            

            let validatedBody = checkValidations(req);
            validatedBody.trader = validatedBody.branch;

            validatedBody.promoCodeOn = promoCode ?  promoCode.promoCodeOn : undefined;

            validatedBody.orderNumber = '' + (new Date()).getTime();
            validatedBody.user = user.id;
            let { trader, products } = await formatProductsArray(validatedBody.products);
            validatedBody.products = products;
            // validatedBody.trader = trader.id;
            // validatedBody.ajamTaxes = Number(trader.ajamTaxes) || 5;
            validatedBody.price = await orderHelper.calculatePrice(validatedBody.products)
            validatedBody = await calculateTotalPrice(validatedBody,promoCode); // get total price;
            validatedBody.finalPrice = validatedBody.totalPrice;

            // if (validatedBody.finalPrice < trader.minimumOrderPrice) {
            //     return next(new ApiError(400, i18n.__('minimumOrderPriceInvalid')))
            // }
            if ((validatedBody.pickupMethod == 'CAR') && (!(validatedBody.carDetails))) {
                return next(new ApiError(400, i18n.__('locationRequired')))
            }

            /////////////////////////// Taxes ///////////////////////////////
            let company = await Company.findOne({ deleted: false }).populate([{ path: 'charity', model: 'charity' }]);
            company = company.toJSON();

            /// assuming all the products price contain taxes
            // if (!trader.productsIncludeTaxes) {
            //     validatedBody.taxes = Number(company.taxes);
            // } else {
            //     validatedBody.taxes = 0;
            // }
            // validatedBody.taxes = (validatedBody.totalPrice / 100 ) * validatedBody.taxes;
            
            // validatedBody.finalPrice = validatedBody.finalPrice + validatedBody.taxes;
            validatedBody.taxes = Number(company.taxes) || 0;
            
            //////////////////////////Treansportation Price////////////////////////////////
            
            
            // if (validatedBody.orderType == 'FROM_STORE') {
            //     validatedBody.receiptFromStoreFees = company.receiptFromStoreFees || 0;
            //     validatedBody.receiptFromStoreFees = (validatedBody.totalPrice / 100) * validatedBody.receiptFromStoreFees;
            //     validatedBody.finalPrice = validatedBody.finalPrice + validatedBody.receiptFromStoreFees;
            //     validatedBody.driverDues = 0;
            // } else {
            //     validatedBody.driverDues = validatedBody.transportPrice;
            //     validatedBody.counterOpeningValue = validatedBody.counterOpeningValue?validatedBody.counterOpeningValue:trader.counterOpeningValue
            // }
            // orderHelper.calculateTransportPrice(validatedBody,promoCode,company); 

            // let paymentMethods = { 
            //     'DIGITAL': 'digital', 
            //     'WALLET': 'wallet', 
            //     'CREDIT': 'credit', 
            //     'MOBILE': 'mobile' 
            // }
            // if (validatedBody.paymentMethod != 'CASH') {
            //     let key = paymentMethods[validatedBody.paymentMethod] + 'PaymentFees';
            //     validatedBody.ePaymentFeesRatio = company[key] || 0; // رقم ثابت وليس نسبة
            //     validatedBody.ePaymentFees = validatedBody.ePaymentFeesRatio; //(validatedBody.totalPrice / 100) * validatedBody.ePaymentFeesRatio;
            //     validatedBody.finalPrice = validatedBody.finalPrice + validatedBody.ePaymentFees;
            // }

            ///////////////////////////////////////////////// Dues  //// assuming all the products price contain taxes
            // if (!trader.productsIncludeTaxes) { // price not include taxes
            //     let taxes = Number(company.taxes);
            //     let traderPrice = validatedBody.totalPrice - ((validatedBody.totalPrice / 100) * taxes);
            //     validatedBody.ajamDues = (traderPrice * (Number(validatedBody.ajamTaxes) / 100)).toFixed(2);
            //     // validatedBody.traderDues = validatedBody.totalPrice - Number(validatedBody.ajamDues);
            // }
            // else {
            //     let traderPrice = validatedBody.totalPrice;
            //     validatedBody.ajamDues = Number((traderPrice * (Number(validatedBody.ajamTaxes) / 100)).toFixed(2));
            //     // validatedBody.traderDues = (traderPrice - Number(validatedBody.ajamDues)) + ((validatedBody.totalPrice / 100) * validatedBody.taxes);
            // }
            let productsTaxes = (validatedBody.finalPrice / 100) * validatedBody.taxes;
            validatedBody.productsTaxes = productsTaxes;
            // let productPrice = validatedBody.totalPrice - productsTaxes;
            // validatedBody.ajamDues = Number((productPrice * (Number(validatedBody.ajamTaxes) / 100)).toFixed(2));
            // validatedBody.traderDues = validatedBody.totalPrice - validatedBody.ajamDues;

            // validatedBody.finalPrice = validatedBody.finalPrice + productsTaxes;
            /////////////////////////////////////////////////////////////////////////////////////////////
            validatedBody.lastActionDate = new Date();
            validatedBody.deleted = ( ['CASH', 'WALLET','POINTS'].includes(validatedBody.paymentMethod)) ? false : true;
            validatedBody.traderAssignDate = new Date();
            if ((validatedBody.paymentMethod == 'WALLET') && (req.user.wallet < validatedBody.finalPrice)) {
                return next(new ApiError(400, i18n.__('walletInvalid')));
            }
            if ( validatedBody.paymentMethod == 'POINTS' ) {
                validatedBody.rewardPointPer = company.rewardPointPer;
                validatedBody.orderPointPrice = company.orderPointPrice;
                validatedBody.points = validatedBody.finalPrice * validatedBody.orderPointPrice ;
                if(req.user.points < validatedBody.points){
                    return next(new ApiError(400, i18n.__('walletPoints')));
                }

            }
            let order = await Order.create(validatedBody);
            order.orderNumber = order.orderNumber + order.id;
            await order.save();
            order = await Order.populate(order, populateQuery)
            if (!['CASH','POINTS'].includes(validatedBody.paymentMethod)  ) {
                await PaymentTransaction.getOrderCheckoutId(req,res,next,order);

                
            } else {
                res.status(200).send(order);
            }
            
            ///////////////////////////////////////////

            if (validatedBody.paymentMethod == 'WALLET') {
                user.wallet = user.wallet - order.finalPrice;
                await user.save();
                userController.updateUserSocket(user.id, user);
                // notificationNSP.to('room-' + user.id).emit(socketEvents.NewUser, { user: user });
            }
            else if (validatedBody.paymentMethod == 'POINTS') {
                user.points = user.points - order.points;
                await user.save();
                await pointsController.create(user,order.points,order.id,'ORDER');
                userController.updateUserSocket(user.id, user);
                // notificationNSP.to('room-' + user.id).emit(socketEvents.NewUser, { user: user });
            }
            /////////////////////////////////////////////////////////////////////

            if (['CASH', 'WALLET'].includes(validatedBody.paymentMethod)) {
                console.log('mmmmmmmmmmmmmmmmmm');
                // await orderConfirmation(order,company,req.user); // TODO --> to be handled
            }

        } catch (err) {
            //console.log(err);
            next(err);
        }
    },

    validateBody() {
        return [

            body('pickupMethod').not().isEmpty().withMessage(() => { return i18n.__('pickupMethodRequired') }),
            body('branch').not().isEmpty().withMessage(() => { return i18n.__('branchRequired') }),
            body('products').not().isEmpty().withMessage(() => { return i18n.__('productsRequired') }),

            body('products.*.parentProduct').optional().not().isEmpty().withMessage(() => { return i18n.__('parentProductRequired') }),
            body('products.*.buyOneGet50Another').optional().not().isEmpty().withMessage(() => { return i18n.__('buyOneGetOneRequired') }).isBoolean(),
            body('products.*.buyOneGetOne').optional().not().isEmpty().withMessage(() => { return i18n.__('buyOneGetOneRequired') }).isBoolean(),

            body('products.*.product').not().isEmpty().withMessage(() => { return i18n.__('productRequired') }),
            body('products.*.quantity').not().isEmpty().withMessage(() => { return i18n.__('quantityRequired') }),
            body('products.*.notes').optional().not().isEmpty().withMessage(() => { return i18n.__('notesRequired') }),
            
            body('products.*.volum').optional().not().isEmpty().withMessage(() => { return i18n.__('volumRequired') }),
            body('products.*.test').optional().not().isEmpty().withMessage(() => { return i18n.__('testRequired') }),
            body('products.*.size').optional().not().isEmpty().withMessage(() => { return i18n.__('sizeRequired') }),
            body('products.*.color').optional().not().isEmpty().withMessage(() => { return i18n.__('colorRequired') }),
            body('products.*.otherProperty').optional().not().isEmpty().withMessage(() => { return i18n.__('otherPropertyRequired') }),

            body('notes').optional().not().isEmpty().withMessage(() => { return i18n.__('notesRequired') }),

            // body('durationDelivery').optional().not().isEmpty().withMessage(() => { return i18n.__('durationDeliveryRequired') }),
            // body('deliveryPricePerSecond').optional().not().isEmpty().withMessage(() => { return i18n.__('deliveryPricePerSecondRequired') }),
            // body('transportPrice').optional().not().isEmpty().withMessage(() => { return i18n.__('transportPriceRequired') }),
            // // body('counterOpeningValue').optional().not().isEmpty().withMessage(() => { return i18n.__('counterOpeningValueRequired') }),
            // body('paymentPhoneNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('paymentPhoneNumberRequired') }),

            body('paymentMethod').not().isEmpty().withMessage(() => { return i18n.__('paymentMethodRequired') })
                .isIn(['WALLET','CASH','POINTS','MADA','VISA','APPLE_PAY','STC']).withMessage(() => { return i18n.__('wrongType') }),

            // body('type').not().isEmpty().withMessage(() => { return i18n.__('typeRequired') })
            //     .isIn(['NORMAL', 'CHARITY']).withMessage(() => { return i18n.__('invalidType') }),
            // body('orderType').not().isEmpty().withMessage(() => { return i18n.__('orderTypeRequired') })
            //     .isIn(['DELIVERY', 'FROM_STORE']).withMessage(() => { return i18n.__('invalidType') }),

            body('carDetails').optional().not().isEmpty().withMessage(() => { return i18n.__('userAddressRequired') }),
            body('carDetails.carType').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
            body('carDetails.carColor').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
            body('carDetails.plateNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),
            body('carDetails.phoneNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('locationRequired') }),


            // body('address').optional().not().isEmpty().withMessage(() => { return i18n.__('addressRequired') })
            //     .custom(async (val, { req }) => {
            //         req.address = await checkExistThenGet(val, Address, { deleted: false, user: req.user.id }, i18n.__('addressNotFound'));
            //         return true;
            //     }),

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

                    // if (promoCode.zones.length > 0) {
                    //     let location = req.body.userAddress;
                    //     if (!(location && location.lat && location.long)) {
                    //         throw new ApiError(400, i18n.__('locationRequired'));
                    //     }
                    //     let inZone = await promocodeController.checkUserAddressInPromoZones(location.lat, location.long, promoCode);
                    //     if (!inZone) {
                    //         throw new ApiError(400, i18n.__('outOfZone'));
                    //     }
                    // }
                    req.promoCode = promoCode;
                    return true;
                }),

            body('order').optional().not().isEmpty().withMessage(() => { return i18n.__('orderRequired') }),
        ];
    },

    traderService,

    orderConfirmation

}