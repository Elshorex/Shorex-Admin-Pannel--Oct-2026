import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import User from "../../models/user.model/user.model.js";
import config from '../../config.js'
// import Ticket from "../../models/ticket.model/ticket.model";
import { body, query } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import { checkExistThenGet } from "../../helpers/CheckMethods.js";
import i18n from 'i18n'
import { json } from "body-parser";
let https = require('https');
let querystring = require('querystring');
// import CreditCard from "../../models/credit.model/credit.model";
import Company from "../../models/company.model/company.model.js";
import Order from "../../models/order.model/order.model.js";
// import { sendHtmlEmail } from "../../services/emailMessage.service";
import PaymentTransaction from '../../models/payment-transaction.model/payment-transaction.model.js';


export default {


    getOrderCheckoutId :async  (request,response, next, order) => {
        try {
            let user = request.user;
            let cardEntityId;
            let checkoutIdPath = '/v1/checkouts';
            let amount = order.finalPrice;
            amount = Math.ceil(amount);
            let name = request.user.name.split(" ");
            if (name.length == 1) {
                name.push(name[0]);
            }

            if (order.paymentMethod == 'APPLE_PAY') {
                cardEntityId = config.payment.appleEntityId;
            }
            else if (order.paymentMethod == 'MADA') {
                cardEntityId = config.payment.madaEntityId;
            }
            else if (order.paymentMethod == 'STC') {
                cardEntityId = config.payment.stcEntityId;
            } else {
                cardEntityId = config.payment.cardEntityId;
            }

            console.log(cardEntityId);
            let body = {
                'entityId': cardEntityId,
                'amount': amount,
                'merchantTransactionId': order.id,
                'currency': config.payment.currency,
                'paymentType': config.payment.paymentType,
                'notificationUrl': config.payment.notificationUrl,
                // 'testMode': config.payment.testMode,
                'customer.email': request.user.email || `info@Coffee-App.co`,
                'billing.street1': request.user.street1 || 'elharam',
                'billing.city': request.user.city || 'Riyadh',
                'billing.state': request.user.address || 'Layla',
                'billing.country': 'SA',
                'billing.postcode': request.user.postcode || '11461',
                'customer.givenName': request.user.givenName || name[0],
                'customer.surname': request.user.surname || name[1]
            }
            console.log('body in check out id ',body);
            let host = config.payment.host;
            let Authorization = config.payment.authToken;
            
            
            let data = querystring.stringify(body);
            let options = {
                port: 443,
                host: host,
                path: checkoutIdPath,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': data.length,
                    'Authorization': Authorization
                }
            };
            console.log(data)
            console.log(options)
            let postRequest = https.request(options, function (res) {
                res.setEncoding('utf8');
                res.on('data', async function (chunk) {

                    let output = JSON.parse(chunk);
                    console.log('out from get checkoutid  ', output);
                    let paymentTransaction = await PaymentTransaction.create({
                        user: user.id,
                        paymentMethod: order.paymentMethod,
                        transactionType: 'PURCHASE',
                        amount: amount,
                        order:order.id,
                        paymentToken:output.id
                    });


                    order.paymentTransaction = paymentTransaction.id;
                    await order.save();
                    response.status(200).send({ order, paymentTransaction });

                });
            });
            postRequest.write(data);
            postRequest.end();
        } catch (error) {
            console.log("error == ", error)
            next(error)
        }
    },

    ///////////////////////////////////  wallet credit 

    validateGetCheckoutId() {
        return [
            body('paymentMethod').not().isEmpty().withMessage(() => { return i18n.__('paymentMethodRequired') })
                .isIn(['MADA','VISA','APPLE_PAY','STC']),
            body('amount').not().isEmpty().withMessage(() => { return i18n.__('amountRequired') })
        ]
    },

    async getCreditCheckoutId(request, response, next) {
        try {
            let user = request.user;
            let cardEntityId;
            let checkoutIdPath = '/v1/checkouts';
            const validatedBody = checkValidations(request);
            let amount = validatedBody.amount;

            let name = request.user.name.split(" ");
            if (name.length == 1) {
                name.push(name[0]);
            }

            if (validatedBody.paymentMethod == 'APPLE_PAY') {
                cardEntityId = config.payment.appleEntityId;
            }
            else if (validatedBody.paymentMethod == 'MADA') {
                cardEntityId = config.payment.madaEntityId;
            }
            else if (validatedBody.paymentMethod == 'STC') {
                cardEntityId = config.payment.stcEntityId;
            } else {
                cardEntityId = config.payment.cardEntityId;
            }

            let data = querystring.stringify({
                'entityId': cardEntityId,
                'amount': amount,
                'currency': config.payment.currency,
                'paymentType': config.payment.paymentType,
                'notificationUrl': config.payment.notificationUrl,
                // 'testMode': config.payment.testMode,
                'customer.email': request.user.email || '',
                'billing.street1': request.user.address || '',
                'billing.city': 'Riyadh',
                'billing.state': 'Layla',
                'billing.country': 'SA',
                'billing.postcode': '11461',
                'customer.givenName': name[0],
                'customer.surname': name[1]
            });

            
            let host = config.payment.host;
            let Authorization = config.payment.authToken;
            

            let options = {
                port: 443,
                host: host,
                path: checkoutIdPath,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': data.length,
                    'Authorization': Authorization
                }
            };
            let postRequest = https.request(options, function (res) {
                res.setEncoding('utf8');
                res.on('data', async function (chunk) {

                    let output = JSON.parse(chunk);

                    let result = { id : output.id   ,result:output , amount: amount }

                    let paymentTransaction = await PaymentTransaction.create({
                        user: user.id,
                        paymentMethod: validatedBody.paymentMethod,
                        transactionType: 'POCKET',
                        amount: amount,
                        paymentToken:output.id
                    });
                    
                    await User.findByIdAndUpdate(request.user.id, { lastCheckoutCredit: amount, lastCheckoutCreditId: output.id });
                    response.status(200).send({paymentTransaction});
                });
            });
            postRequest.write(data);
            postRequest.end();
        } catch (error) {
            next(error)
        }
    },

    validateGetPaymentStatus() {
        return [
            body('paymentTransaction').not().isEmpty().withMessage('paymentTransactionRequired'),
            // body('paymentMethod').not().isEmpty().withMessage(() => { return i18n.__('paymentMethodRequired') })
            //     .isIn(['MADA','VISA','APPLE_PAY','STC']),
            // body('applePay').optional().not().isEmpty().withMessage('applePayRequired'),
            // body('stc').optional().not().isEmpty().withMessage('stcRequired'),
            // body('mada').optional().not().isEmpty().withMessage('madaRequired')
        ] 
    },

    async getPaymentStatus(request, response, next) {
        try {
            const validatedBody = checkValidations(request);
            let user = request.user;
            console.log('validatedBody ',validatedBody);
            let paymentTransaction = await checkExistThenGet(
                validatedBody.paymentTransaction,
                PaymentTransaction,
                {deleted:false,user:user.id,status : 'WAITING'}
            );
            let path = '/v1/checkouts/' + paymentTransaction.paymentToken + '/payment?entityId=';
            // path += '?entityId=' +( validatedBody.applePay ? config.payment.appleEntityId :
            // validatedBody.mada ? config.payment.madaEntityId  : config.payment.cardEntityId);


            if (paymentTransaction.paymentMethod == 'APPLE_PAY') {
                path +=  config.payment.appleEntityId;
            }
            else if (paymentTransaction.paymentMethod == 'MADA') {
                path += config.payment.madaEntityId;
            }
            else if (paymentTransaction.paymentMethod == 'STC') {
                path += config.payment.stcEntityId;
            } else {
                path += config.payment.cardEntityId;
            }


            let options = {
                port: 443,
                host: config.payment.host,
                path: path,
                method: 'GET',
                headers: {
                    'Authorization': config.payment.authToken
                }
            };
            //console.log(options)
            let jsonResult = "";
            let postRequest = https.request(options, function (res) {
                res.setEncoding('utf8');
                res.on('data', async function (chunk) {
                    try {
                        jsonResult = jsonResult + chunk;
                    } catch (error) {
                        next(error);
                    }
                });
                res.on('end', async function () {
                    try {
                        let state = JSON.parse(jsonResult);
                        console.log('state ',state );
                        const success_regex_1 = RegExp(/^(000\.000\.|000\.100\.1|000\.[36])/);
                        const success_regex_2 = RegExp(/^(000\.400\.0[^3]|000\.400\.100)/);
                        if ((success_regex_1.test(state.result.code) || success_regex_2.test(state.result.code) && request.user)) {
                            let order ;
                            if (paymentTransaction.order) {
                                order = await checkExistThenGet(paymentTransaction.order,Order,{});
                                order.deleted = false;
                                await order.save();
                                // return response.status(200).send({ success: true, user, result: i18n.__('paymentSuccess') });
                            } else {
                                user.credit = user.credit + paymentTransaction.amount;
                                user.lastCheckoutCredit = 0;
                                await user.save();
                            }
                            paymentTransaction.status = 'SUCCESS';
                            await paymentTransaction.save();
                            return response.status(200).send({ success: true, user,order, result: i18n.__('paymentSuccess') });
                        } else {
                            paymentTransaction.status = 'FAILES';
                            await paymentTransaction.save();
                            return response.status(200).send({ success: false ,paymentTransaction});
                        }
                        
                    } catch (error) {
                        next(error)
                    }
                })
            });
            postRequest.end();
        } catch (error) {
            next(error)
        }
    },

    async findById(req, res, next) {
        try {
            let { id } = req.params;
            let trans = await checkExistThenGet(id, PaymentTransaction, { deleted: false });


            
            res.status(200).send(trans);
        } catch (err) {
            next(err);
        }
    },

    ////////////////////////////////////////////////// callback

    async notification(request, response, next) {
        try {
            let { id, resourcePath } = request.query;
            const validatedBody = { resourcePath: resourcePath }
            let path = '/v1/checkouts/' + validatedBody.resourcePath + '/payment';
            path += '?entityId=' + config.payment.cardEntityId;
            console.log(path)
            let options = {
                port: 443,
                host: config.payment.host,
                path: path,
                method: 'GET',
                headers: {
                    'Authorization': config.payment.authToken
                }
            };
            let jsonResult = "";
            let postRequest = https.request(options, function (res) {
                res.setEncoding('utf8');
                res.on('data', async function (chunk) {
                    try {
                        jsonResult = jsonResult + chunk;
                    } catch (error) {
                        next(error);
                    }
                });
                res.on('end', async function () {
                    console.log('end jsonResult ==> ',jsonResult);
                    let state = JSON.parse(jsonResult);
                    const success_regex_1 = RegExp(/^(000\.000\.|000\.100\.1|000\.[36])/);
                    const success_regex_2 = RegExp(/^(000\.400\.0[^3]|000\.400\.100)/);
                    if (success_regex_1.test(state.result.code) || success_regex_2.test(state.result.code)) {
                        let user = await User.findOne({ deleted: false, lastCheckoutCreditId: validatedBody.resourcePath });
                        if (user) {
                            user.credit = user.credit + user.lastCheckoutCredit;
                            user.lastCheckoutCredit = 0;
                            await user.save();
                            return response.status(200).send({ user, result: i18n.__('paymentSuccess') });
                        } else {
                            await Ticket.updateMany({ checkoutId: validatedBody.resourcePath }, { $set: { paymentStatus: 'SUCCESSED' } });
                            return response.status(200).send({ result: i18n.__('paymentSuccess') });
                        }
                    } else {
                        await Ticket.updateMany({ checkoutId: validatedBody.resourcePath }, { $set: { deleted: true, paymentStatus: 'FAILED' } });
                        return response.status(400).send({ result: i18n.__('paymentFail') });
                    }
                })
            });
            postRequest.end();
        } catch (error) {
            next(error)
        }
    },

    ////////////////////////////////////////////////// refund

    validateRefund() {
        return [
            body('ticket').not().isEmpty().withMessage('ticketRequired')
        ]
    },

    async refundCreditPayment(req, response, next) {
        try {
            const validatedBody = checkValidations(req);
            let ticket = await checkExistThenGet(validatedBody.ticket, Ticket, { populate: [{ path: 'creditCard', model: 'credit' }, { path: 'show', populate: {path: 'user', model: 'user'}, model: 'show' }], 
                                                    // user: req.user.id,
                                                    deleted: false, 
                                                    // paymentStatus: {$in: ['PENDING','SUCCESSED']},
                                                    // paymentMethod: {$in: ['CREDIT','STC','APPLE_PAY', '']}
                                                 }
                                                );

            let company = await Company.findOne({ deleted: false });
            let fromDate = new Date(ticket.date.date).setMinutes(ticket.date.fromTime/(60 * 1000) - company.cancelBefore * 60);
            if (new Date() > fromDate || ( ticket.show.user.canReturn && ticket.show.user.canReturn === true)) {
                let message = i18n.__('mustCancelBefore');
                // let message = i18n.__('mustCancelBefore') + company.cancelBefore + i18n.__('h');
                return next(new ApiError(400, message))
            }
            if(ticket.show.adminShowType && ticket.show.adminShowType === "FREE") {
                ticket.paymentStatus = 'REFUNDED';
                ticket.deleted = true;
                await ticket.save();
                return response.status(200).send({ message: i18n.__('freeRefundedSuccessfully') });
            }

            if(!(ticket.show.adminShowType && ticket.show.adminShowType === "FREE") &&
            (ticket.paymentStatus !== "SUCCESSED")) {
               ticket.paymentStatus = 'REFUNDED';
               ticket.deleted = true;
               await ticket.save();
               return response.status(200).send({ message: i18n.__('refundedSuccessfully') });
           }


            let checkoutId = ticket.paymentId;
            console.log(checkoutId);
            const path = `/v1/payments/${checkoutId}`;
            console.log(path)
            const data = querystring.stringify({
                'entityId': 
                (ticket.paymentMethod == 'APPLE_PAY') ? config.payment.appleEntityId :
                (ticket.paymentBrand == 'MADA')? config.payment.madaEntityId :config.payment.cardEntityId,
                'paymentType': 'RF',
                'amount': ticket.ticketsPricing,
                'currency': config.payment.currency
            });
            const options = {
                port: 443,
                host: config.payment.host,
                path: path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': data.length,
                    'Authorization': config.payment.authToken
                }
            };

            let promisDate = new Promise((resolve, reject) => {
                const postRequest = https.request(options, function (res) {
                    const buf = [];
                    res.on('data', chunk => {
                        buf.push(Buffer.from(chunk));
                    });
                    res.on('end', () => {
                        const jsonString = Buffer.concat(buf).toString('utf8');
                        try {
                            resolve(JSON.parse(jsonString));
                        } catch (error) {
                            reject(error);
                        }
                    });
                });
                postRequest.on('error', reject);
                postRequest.write(data);
                postRequest.end();
            });
            let result = await promisDate;
            const success_regex_1 = RegExp(/^(000\.000\.|000\.100\.1|000\.[36])/);
            const success_regex_2 = RegExp(/^(000\.400\.0[^3]|000\.400\.100)/);
            if (success_regex_1.test(result.result.code) || success_regex_2.test(result.result.code)) {
                ticket.paymentStatus = 'REFUNDED';
                ticket.deleted = true;
                await ticket.save();
                response.status(200).send({ message: i18n.__('refundedSuccessfully') });
            } else {
                response.status(400).send(result);
            }
        } catch (error) {
            next(error);
        }
    },

    async refundWalletPayment(req, res, next) {
        try {
            let user = req.user;
            const validatedBody = checkValidations(req);
            let ticket = await checkExistThenGet(validatedBody.ticket, Ticket, { user: req.user.id, deleted: false, paymentMethod: { $in: ['CASH', 'WALLET'] } });
            if (ticket.paymentMethod == 'WALLET') {
                user.credit = user.credit + (+ticket.ticketsPricing);
                await user.save();
            }
            ticket.paymentStatus = 'REFUNDED';
            ticket.deleted = true;
            await ticket.save();
            res.status(200).send({ message: i18n.__('refundedSuccessfully') });
        } catch (error) {
            next(error);
        }
    }
};
