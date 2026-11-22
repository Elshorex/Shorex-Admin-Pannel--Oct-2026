// import Address from "../../models/address.model/address.model";
// import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods.js";
import utf8 from 'utf8';
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import userController from "../user.controller/user.controller.js";
import i18n from 'i18n';
// import moment from 'moment'
// import ApiError from "../../helpers/ApiError";
// import orderController from '../order.controller/order.controller'

import PaymentTransaction from '../../models/payment-transaction.model/payment-transaction.model.js';
import Order from '../../models/order.model/order.model.js';
import config from "../../config.js";
import axios from 'axios';
import normalOrder from '../order.controller/normal-order.js';
// import orderModel from "../../models/order.model/order.model";
// import socketEvents from '../../socketEvents';
// import notifyController from '../notif.controller/notif.controller';
// import userController from "../user.controller/user.controller";
import ApiError from "../../helpers/ApiError.js";

const authenticationTokenRequest = async () => {
    try {
        let url = config.payment.baseUrl + '/api/auth/tokens';
        let body = { "api_key": config.payment.apiKey };
        let result = await axios.post(url, body);
        console.log('mmmmmmmmmmmmmmmmmm ', result.data.token , 'gggggggggg');
        return result.data.token;
    } catch (error) {
        console.log('ereeeeeeeeeeeeeeeeeeeeeeeeee authenticationTokenRequest');
        throw error
    }
}

const registerOrder = async (order, authToken) => {
    try {
        let url = config.payment.baseUrl + '/api/ecommerce/orders';
        let body = {
            "auth_token": authToken,
            "delivery_needed": "false",
            "amount_cents": Math.ceil(order.finalPrice) * 100 ,
            "currency": config.payment.currency,
            "merchant_order_id": order.orderNumber + '-' + order.id,
            "items": []
        }

        console.log('data ',body);

        let result = await axios.post(url, body);
        return result.data.id;
    } catch (error) {
        console.log('ereeeeeeeeeeeeeeeeeeeeeeeeee registerOrder' ,error);
        throw error;
    }
}

const mobileWalletUrl = async (payment_token, order) => {
    try {
        let url = config.payment.baseUrl + '/api/acceptance/payments/pay';
        let body = {
            "source": {
                "identifier": order.paymentPhoneNumber,
                "subtype": "WALLET"
            },
            "payment_token": payment_token
        }
        console.log('body ',body);
        let result = await axios.post(url, body);
        let redirect_url = result.data.redirect_url;
        return redirect_url;

    } catch (error) {
        console.log('eeeeeeeeeeeeeee mobileWalletUrl',error);
        throw error;
    }
}



export default {

    async paymentKeyRequest(order, user) {
        try {
            let authToken = await authenticationTokenRequest();
            let orderId = await registerOrder(order, authToken);
            let integrationId = (order.paymentMethod == 'DIGITAL') ? config.payment.wallet_integration_id : config.payment.card_integration_id;
            let url = config.payment.baseUrl + '/api/acceptance/payment_keys';
            let body = {
                "auth_token": authToken,
                "amount_cents":  Math.ceil(order.finalPrice) * 100,
                "currency": config.payment.currency,
                "expiration": 3600,
                "order_id": orderId,
                "billing_data": {
                    "first_name": user.name,
                    "last_name": user.name,
                    "email": user.email,
                    "phone_number": user.phone,
                    "apartment": "NA",
                    "floor": "NA",
                    "street": "NA",
                    "building": "NA",
                    "shipping_method": "NA",
                    "postal_code": "NA",
                    "city": "NA",
                    "country": "NA",
                    "state": "NA"
                },
                "integration_id": integrationId,
                "lock_order_when_paid": "false"
            }
            let result = await axios.post(url, body);
            let paymentToken = result.data.token;
            let frameUrl;
            if (order.paymentMethod == 'DIGITAL') {
                frameUrl = await mobileWalletUrl(paymentToken,order);
            } else {
                frameUrl = config.payment.baseUrl + `/api/acceptance/iframes/${config.payment.frameId}?payment_token=${paymentToken}`
            }

            let paymentTransaction = await PaymentTransaction.create({
                user: user.id,
                paymentMethod: order.paymentMethod,
                transactionType: 'PURCHASE',
                order: order.id,
                orderId: orderId,
                orderNumber: order.orderNumber,
                paymentToken: paymentToken,
                amount:  Math.ceil(order.finalPrice)
            });
            order.paymentTransaction = paymentTransaction.id;
            await order.save();

            return { paymentTransaction, frameUrl };
        } catch (error) {
            console.log('paymentKeyRequestpaymentKeyRequest ',error.response);
            throw error;
        }
    },

    async paymentTransactionInquiry(req, res, next) {
        try {

            let user = req.user;
            let { transactionId, orderId } = req.params;
            let order = await checkExistThenGet(orderId, Order, { paymentTransaction: transactionId });
            let transaction = await checkExistThenGet(transactionId, PaymentTransaction, { deleted: false, user: user.id, status: 'WAITING' });
            let authToken = await authenticationTokenRequest();
            let { inquiryUrl } = config.payment;
            let body = { "auth_token": authToken, "merchant_order_id": order.orderNumber + '-' + order.id, "order_id": transaction.orderId };

            inquiryUrl = utf8.encode('https://accept.paymobsolutions.com/api/ecommerce/orders/transaction_inquiry');

            let result = await axios.post(inquiryUrl, body);

            if (result.data.obj && (result.data.obj.success != true)) {
                return next(new ApiError(400, i18n.__('canNotPay')));
            } else {
                transaction.status = 'SUCCESS';
                order.deleted = false;
                await order.save();
                await transaction.save();
                order = await Order.populate(order, [{ path: 'trader', model: 'user' }]);
                await normalOrder.orderConfirmation(order, null, user);
            }
            res.status(200).send({ order });
        } catch (error) {
            next(error);
        }
    },


    async findById(req, res, next) {
        try {
            let { transactionId } = req.params;
            let trx = await checkExistThenGet(transactionId, PaymentTransaction, { deleted: false });
            res.status(200).send({ trx });
        } catch (err) {
            next(err);
        }
    },

    ////////////////////////////// charge wallet


    validateInitializeCreditCharge() {
        return [
            body('amount').not().isEmpty().withMessage(() => { return i18n.__('amountRequired') })
        ]
    },

    async initializeCreditCharge(req, res, next) {
        try {
            let user = req.user;
            let validatedBody = checkValidations(req);
            let amount = validatedBody.amount;
            let authToken = await authenticationTokenRequest();
            let orderNumber = new Date().getTime();
            let orderId = await registerOrder({ id: user.id, orderNumber, finalPrice: amount }, authToken);
            let integrationId = config.payment.card_integration_id;
            let url = config.payment.baseUrl + '/api/acceptance/payment_keys';
            let body = {
                "auth_token": authToken,
                "amount_cents": amount * 100,
                "currency": config.payment.currency,
                "expiration": 3600,
                "order_id": orderId,
                "billing_data": {
                    "first_name": user.name,
                    "last_name": user.name,
                    "email": user.email,
                    "phone_number": user.phone,
                    "apartment": "NA",
                    "floor": "NA",
                    "street": "NA",
                    "building": "NA",
                    "shipping_method": "NA",
                    "postal_code": "NA",
                    "city": "NA",
                    "country": "NA",
                    "state": "NA"
                },
                "integration_id": integrationId,
                "lock_order_when_paid": "false"
            }

            let result = await axios.post(url, body);
            let paymentToken = result.data.token;

            let paymentTransaction = await PaymentTransaction.create({
                user: user.id,
                paymentMethod: 'CREDIT',
                transactionType: 'POCKET',
                orderId: orderId,
                orderNumber: orderNumber,
                paymentToken: paymentToken,
                amount: amount
            });

            let frameUrl = config.payment.baseUrl + `/api/acceptance/iframes/${config.payment.frameId}?payment_token=${paymentToken}`

            res.status(200).send({ frameUrl, paymentTransaction });
        } catch (error) {
            console.log('eggggg ');
            next(error);
        }
    },

    async chargeTransactionInquiry(req, res, next) {
        try {

            let user = req.user;
            let { transactionId } = req.params;
            let transaction = await checkExistThenGet(transactionId, PaymentTransaction, { deleted: false, transactionType: 'POCKET', user: user.id, status: 'WAITING' });
            let authToken = await authenticationTokenRequest();
            let { inquiryUrl } = config.payment;
            let body = { "auth_token": authToken, "merchant_order_id": transaction.orderNumber + '-' + user.id, "order_id": transaction.orderId };

            inquiryUrl = utf8.encode('https://accept.paymobsolutions.com/api/ecommerce/orders/transaction_inquiry');

            let result = await axios.post(inquiryUrl, body);

            if (result.data.obj && (result.data.obj.success != true)) {
                return next(new ApiError(400, i18n.__('canNotPay')));
            } else {
                transaction.status = 'SUCCESS';
                await transaction.save();
                user.wallet = Number(user.wallet) + Number(transaction.amount);
                await user.save();
                userController.updateUserSocket(user.id);
            }
            res.status(200).send({ user });
        } catch (error) {
            next(error);
        }
    }
}