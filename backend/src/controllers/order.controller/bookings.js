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
import orderController from "./order.controller.js";
import Zone from "../../models/zone.model/zone.model.js";
import orderHelper from './helpers.js';
import PaymentTransaction from '../payment-transaction.controller/payment-transaction.controller.js'
import promocodeController from "../promocode.controller/promocode.controller.js";

let populateQuery = [
    { path: 'user', model: 'user' },
    { path: 'driver', model: 'user' },
    { path: 'trader', model: 'user' },
    { path: 'products.product', model: 'product', populate: [{ path: 'trader', model: 'user' }, { path: 'productCategory', model: 'productCategory' }] },
    { path: 'address', model: 'address', populate: [{ path: 'city', model: 'city', populate: [{ path: 'country', model: 'country' }] }] },
    { path: 'promoCode', model: 'promocode' },
    { path: 'branch', model: 'user' }
];


////////////////////////////////////////////////////////////////////////////
export default {


    async create(req, res, next) {
        try {
            let user = req.user;
            let promoCode = req.promoCode ? req.promoCode : null;
            let validatedBody = checkValidations(req);
            validatedBody.trader = validatedBody.branch;
            validatedBody.type = 'BOOKING'

            validatedBody.promoCodeOn = promoCode ?  promoCode.promoCodeOn : undefined;

            validatedBody.orderNumber = '' + (new Date()).getTime();
            validatedBody.user = user.id;
            
            
            // validatedBody.price = await orderHelper.calculatePrice(validatedBody.products)
            // validatedBody = await calculateTotalPrice(validatedBody,promoCode); // get total price;
            // validatedBody.finalPrice = validatedBody.totalPrice;

            // if (validatedBody.finalPrice < trader.minimumOrderPrice) {
            //     return next(new ApiError(400, i18n.__('minimumOrderPriceInvalid')))
            // }
            

            /////////////////////////// Taxes ///////////////////////////////
           

            /// assuming all the products price contain taxes
            // if (!trader.productsIncludeTaxes) {
            //     validatedBody.taxes = Number(company.taxes);
            // } else {
            //     validatedBody.taxes = 0;
            // }
            // validatedBody.taxes = (validatedBody.totalPrice / 100 ) * validatedBody.taxes;
            
            // validatedBody.finalPrice = validatedBody.finalPrice + validatedBody.taxes;
            // validatedBody.taxes = Number(company.taxes);
            
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
            //     validatedBody.ePaymentFeesRatio = company[key]; // رقم ثابت وليس نسبة
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
            // let productsTaxes = (validatedBody.totalPrice / 100) * validatedBody.taxes;
            // validatedBody.productsTaxes = productsTaxes;
            // let productPrice = validatedBody.totalPrice - productsTaxes;
            // validatedBody.ajamDues = Number((productPrice * (Number(validatedBody.ajamTaxes) / 100)).toFixed(2));
            // validatedBody.traderDues = validatedBody.totalPrice - validatedBody.ajamDues;

            /////////////////////////////////////////////////////////////////////////////////////////////
            validatedBody.lastActionDate = new Date();
            // validatedBody.deleted = ( ['CASH', 'WALLET'].includes(validatedBody.paymentMethod)) ? false : true;
            validatedBody.traderAssignDate = new Date();
            if ((validatedBody.paymentMethod == 'WALLET') && (req.user.wallet < validatedBody.finalPrice)) {
                return next(new ApiError(400, i18n.__('walletInvalid')));
            }
            let order = await Order.create(validatedBody);
            order.orderNumber = order.orderNumber + order.id;
            await order.save();
            order = await Order.populate(order, populateQuery)
            // if (validatedBody.paymentMethod != 'CASH') {
            //     let { paymentTransaction, frameUrl } = await PaymentTransaction.paymentKeyRequest(order, user);
            //     console.log('frameUrl ',frameUrl);
            //     res.status(200).send({ order, paymentTransaction, frameUrl });
            // } else {
                res.status(200).send(order);
            // }
            
            ///////////////////////////////////////////

            if (validatedBody.paymentMethod == 'WALLET') {
                user.wallet = user.wallet - order.finalPrice;
                await user.save();
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

            body('branch').not().isEmpty().withMessage(() => { return i18n.__('branchRequired') }),
            body('numberOfGuests').not().isEmpty().withMessage(() => { return i18n.__('numberOfGuestsRequired') }),
            body('notes').optional().not().isEmpty().withMessage(() => { return i18n.__('notesRequired') }),
            body('date').not().isEmpty().withMessage(() => { return i18n.__('dateRequired') }),
            body('time').not().isEmpty().withMessage(() => { return i18n.__('timeRequired') }),

            body('firstName').not().isEmpty().withMessage(() => { return i18n.__('fNameRequired') }),
            body('lastName').not().isEmpty().withMessage(() => { return i18n.__('lNameRequired') }),
            body('phone').not().isEmpty().withMessage(() => { return i18n.__('phoneRequired') }),
            body('email').optional().not().isEmpty().withMessage(() => { return i18n.__('emailRequired') }),
            body('specialRequests').optional().not().isEmpty().withMessage(() => { return i18n.__('specialRequestsRequired') }),

           
            body('paymentMethod').optional().not().isEmpty().withMessage(() => { return i18n.__('paymentMethodRequired') })
                .isIn(['WALLET','CASH','POINTS','MADA','VISA','APPLE_PAY','STC']).withMessage(() => { return i18n.__('wrongType') }),

            
            

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
                })

        ];
    }
}