import https from 'https';
import querystring from 'querystring';
import Order from "../../models/order.model/order.model.js";
import User from '../../models/user.model/user.model.js';
import ApiError from "../../helpers/ApiError.js";
import i18n from 'i18n';
import config from '../../config.js';
import socketEvents from '../../socketEvents.js';
import { sendHtmlEmail } from '../../services/emailMessage.service.js';
import schedule from 'node-schedule';
import userController from '../user.controller/user.controller.js';
import Company from '../../models/company.model/company.model.js';




export default {

    calculatePoints: async(order)=>{
        try {
            let company = await Company.findOne({deleted:false});
            let points = ['POINTS'].includes(order.paymentMethod) ? 0 : (order.finalPrice * company.rewardPointPer);
            return Number(points.toFixed(2));
        } catch (error) {
            console.log(error);
        }
    },

    refundOrderMoney: async (order) => {
        try {
            if (order.paymentMethod == 'CASH') {
                return true;
            }
            let client = order.user;
            console.log('will refund order ',client.id);
            client.wallet = client.wallet + order.finalPrice;
            client =  await User.findByIdAndUpdate(client.id , {wallet : client.wallet}) ;
            userController.updateUserSocket(client);
        } catch (error) {
            console.log('can not refund order');
        }
    },

    cancelJob: (jobName) => {
        try {
            let job = schedule.scheduledJobs[jobName];
            console.log('============== job ======================');
            console.log(job);
            console.log('====================================');
            if (job) {
                job.cancel();
            }
        } catch (error) {
            throw error;
        }
    },

    clientOrdersCount: async (userId) => {
        try {
            let currentOrdersQuery = { deleted: false, user: userId }
            let count = await Order.count(currentOrdersQuery)

            await User.findByIdAndUpdate(userId, { ordersCount: count });

        } catch (error) {
            throw error;
        }
    },

    driverOrdersCount: async (userId) => {
        try {
            let fastOrdersQuery = { deleted: false, driver: userId, type: 'FAST', status: { $in: ['ACCEPTED', 'DRIVER_ACCEPTED', 'PREPARED', 'SHIPPED'] } };
            let currentOrdersQuery = { deleted: false, driver: userId, status: { $in: ['ACCEPTED', 'DRIVER_ACCEPTED', 'PREPARED', 'NOT_ASSIGN', 'SHIPPED'] } };
            // let finishedOrdersQuery = { deleted: false, driver: userId, status: { $in: ['DELIVERED'] } };

            let promiseData = [
                Order.count(currentOrdersQuery),
                Order.count(fastOrdersQuery)
                // Order.count(finishedOrdersQuery)
            ];
            let result = await Promise.all(promiseData);
            notificationNSP.to('room-' + userId).emit(socketEvents.CurrentOrdersCount, { count: result[0] });
            notificationNSP.to('room-' + userId).emit(socketEvents.FastOrdersCount, { count: result[1] });

            // await User.findByIdAndUpdate(userId, { currentOrderCount: result[0], finishedOrderCount: result[1] })

        } catch (error) {
            throw error;
        }
    },

    increaseCurrentRejectedCount:async (driver)=>{
        driver.currentRejectedCount = driver.currentRejectedCount +1;
        if (driver.currentRejectedCount >= driver.stopDriverAfetrReject) {
            driver.currentRejectedCount = 0;
            driver.stopUntil = new Date().setDate( new Date().getDate() + driver.numberOfDaysToStopDriver );
        }
        await driver.save();
    },

    TraderNotResponseCount: async () => {
        try {
            let count = await Order.count({ deleted: false, traderNotResponse: true, status: 'WAITING' });
            adminNSP.emit(socketEvents.TraderNotResponseCount, { count: count });
        } catch (error) {
            throw error;
        }
    },
    notAssignCount: async () => {
        try {
            let count = await Order.count({ deleted: false, status: 'NOT_ASSIGN' });
            adminNSP.emit(socketEvents.NotAssignCount, { count: count });
        } catch (error) {
            throw error;
        }
    },

    traderOrdersCount: async (userId) => {
        try {
            let newOrdersQuery = { deleted: false, status: 'WAITING', trader: userId, traderNotResponse: false };
            let currentOrdersQuery = {
                deleted: false, trader: userId,
                status: {
                    $in: [
                        'ACCEPTED', 'DRIVER_ACCEPTED', 'PREPARED', 'SHIPPED', 'NOT_ASSIGN'
                    ]
                }
            };
            // let finishedOrdersQuery = { deleted: false, trader: userId, status: { $in: ['DELIVERED'] } };

            let promiseData = [
                Order.count(newOrdersQuery),
                Order.count(currentOrdersQuery),
                //Order.count(finishedOrdersQuery)
            ];
            let result = await Promise.all(promiseData);

            notificationNSP.to('room-' + userId).emit(socketEvents.NewOrdersCount, { count: result[0] });
            notificationNSP.to('room-' + userId).emit(socketEvents.CurrentOrdersCount, { count: result[1] });
            // notificationNSP.to('room-' + userId).emit(socketEvents.FinishedOrdersCount, { count: result[2] });
            // await User.findByIdAndUpdate(userId, { waitingOrderCount: result[0], currentOrderCount: result[1], finishedOrderCount: result[2] })

        } catch (error) {
            throw error;
        }
    },

    findAdditionProperties: (product, key, id) => {
        try {
            let property;
            let length = product[key].length;
            for (let index = 0; index < length; index++) {
                if (product[key][index]._id == id) {
                    property = product[key][index];
                    delete property._id;
                }
            }
            if (!property) {
                throw new ApiError(404, i18n.__(`${key} not found`));
            }
            return property;

        } catch (error) {
            throw error;
        }
    },

    findOtherAdditionProperties: (product, ids) => {
        try {
            let other = {};
            let idsLength = ids.length;
            let otherPropertyLength = product['otherProperty'].length;

            for (let k = 0; k < idsLength; k++) {
                let id = ids[k];
                let property;
                for (let index = 0; index < otherPropertyLength; index++) {


                    let propertiesLength = product['otherProperty'][index].properties.length;

                    for (let j = 0; j < propertiesLength; j++) {

                        if (product['otherProperty'][index].properties[j]._id == id) {
                            property = { _id: product['otherProperty'][index]._id, name: product['otherProperty'][index].name, property: { property: product['otherProperty'][index].properties[j].property, price: product['otherProperty'][index].properties[j].price || 0 } }
                            break;
                        }
                    }
                    if (property) {
                        break;
                    }
                }
                if (!property) {
                    throw new ApiError(404, i18n.__(`addition not found`));
                }

                delete property.property._id;
                if (other[property._id]) {
                    other[property._id].properties.push(property.property);
                } else {
                    other[property._id] = { name: property.name, properties: [{ ...property.property }] };
                }
            }

            let result = Object.keys(other)
                .map(function (key) {
                    return other[key];
                });
            return result;

        } catch (error) {
            throw error;
        }
    },

    calculatePrice : async (list) => {
        let price = 0;
        for (let index = 0; index < list.length; index++) {
            // if (list[index].offer && list[index].offer > 0) {
            //     price = price + ((list[index].price - (+(list[index].price * (list[index].offer / 100.0)).toFixed(3))) * list[index].quantity);
            // }
            // else {
            //     price = price + (list[index].price * list[index].quantity)
            // }
            price = price + (list[index].priceAfterOffer * list[index].quantity);
        }
        return price;
    },

    calculateTransportPrice: (validateBody, promoCode,company) => {

        if (validateBody.orderType != 'DELIVERY') {
            validateBody.transportPrice = 0;
            return validateBody;
        }
        if (!(validateBody.durationDelivery && validateBody.deliveryPricePerSecond && validateBody.transportPrice)) {
            console.log('cccc ',validateBody.durationDelivery , validateBody.deliveryPricePerSecond , validateBody.transportPrice);
            throw new ApiError(400, i18n.__('invalidTransportPrice'));
        }
        if (validateBody.type == 'CHARITY') {
            return validateBody;
        }

        if (promoCode && (promoCode.promoCodeOn == 'TRANSPORTATION')) {
            let priceBeforeDiscount;
            if (promoCode.promoCodeType == 'RATIO') {

                priceBeforeDiscount = Number(validateBody.transportPrice);
                validateBody.discountValue = (priceBeforeDiscount * (promoCode.discount / 100))
                if (promoCode.maxAmount && (validateBody.discountValue > promoCode.maxAmount)) {
                    validateBody.discountValue = Number(promoCode.maxAmount);
                }
                validateBody.transportPrice = Number((priceBeforeDiscount - Number(validateBody.discountValue)).toFixed(3));

            } else {

                priceBeforeDiscount = Number(validateBody.transportPrice);
                validateBody.discountValue = (((priceBeforeDiscount - promoCode.discount) > 0) ? promoCode.discount : 0);
                validateBody.transportPrice = Number(priceBeforeDiscount) - Number(validateBody.discountValue)

            }
            validateBody.finalPrice = Number(validateBody.finalPrice) + validateBody.transportPrice;

        } else {
            validateBody.discountValue = 0 ;
            validateBody.finalPrice = validateBody.finalPrice + Number(validateBody.transportPrice);
        }

        validateBody.transportationTaxes = company.transportationTaxes;
        validateBody.transportationTaxesValue = ((validateBody.transportPrice / 100 ) *  validateBody.transportationTaxes).toFixed(2);
        validateBody.transportationTaxesValue = Number(validateBody.transportationTaxesValue);

        validateBody.finalPrice = validateBody.finalPrice + validateBody.transportationTaxesValue;
        return validateBody;
    },

    stillOfferExist(product){
        if ( !(product.offerStartDate && product.offerEndDate) ) {
            return false;
        }
        let offerExist = false ;
        let start = new Date(product.offerStartDate).getTime();
        let end = new Date(product.offerEndDate).getTime();
        let current = new Date().getTime();
        if ( (current >= start)&& (current <= end)  ) {
            offerExist = true;
        }
        return offerExist ;
    },

    applyProductsPromo: (orderData, promo) => { // collect discounts 

        let products = orderData.products;
        let productsLength = products.length;
        let discountValue = 0;

        for (let p = 0; p < productsLength; p++) {
            let product = products[p].productData || products[p].product;
            if (promo.products.includes(+product.id)) {
                let priceBeforeDiscount = products[p].priceAfterOffer;

                if (promo.promoCodeType == 'RATIO') {
                    let productDiscount = (priceBeforeDiscount / 100) * promo.discount;
                    if (promo.maxAmount && (productDiscount > promo.maxAmount)) {
                        productDiscount = promo.maxAmount;
                    }
                    productDiscount = (productDiscount > priceBeforeDiscount) ? priceBeforeDiscount : productDiscount;
                    discountValue = discountValue + (productDiscount * products[p].quantity);
                } else {
                    let productDiscount = (((priceBeforeDiscount - promo.discount) < 0) ? priceBeforeDiscount : promoCode.discount);
                    discountValue = discountValue + (productDiscount * products[p].quantity);
                }

            }
        }
        console.log('discountValue products ', discountValue);
        return discountValue;
    },

    applyCategoriesPromo: (orderData, promo) => {

        let discountValue = 0;
        let trader = orderData.products[0].traderData || orderData.products[0].product.trader;
        console.log('orderDataorderData ',orderData);
        if (promo.categories.some(r => trader.category.includes(r))) {
            let priceBeforeDiscount = orderData.price;
            console.log('priceBeforeDiscount ',priceBeforeDiscount);
            if (promo.promoCodeType == 'RATIO') {
                let institutionDiscount = (priceBeforeDiscount / 100) * promo.discount;
                if (promo.maxAmount && (institutionDiscount > promo.maxAmount)) {
                    institutionDiscount = promo.maxAmount;
                }
                institutionDiscount = (institutionDiscount > priceBeforeDiscount) ? priceBeforeDiscount : institutionDiscount;
                discountValue = discountValue + institutionDiscount;
            } else {
                let institutionDiscount = (((priceBeforeDiscount - promo.discount) < 0) ? priceBeforeDiscount : promoCode.discount);
                discountValue = discountValue + institutionDiscount;
            }

        }

        console.log('discountValue institutions ', discountValue);
        return discountValue;
    },

    applyInstitutionsPromo: (orderData, promo) => {
        
        let discountValue = 0;
        let trader = orderData.products[0].traderData || products[0].product.trader;

        if (promo.institutions.includes(+trader.id)) {
            let priceBeforeDiscount = orderData.price;

            if (promo.promoCodeType == 'RATIO') {
                let institutionDiscount = (priceBeforeDiscount / 100) * promo.discount;
                if (promo.maxAmount && (institutionDiscount > promo.maxAmount)) {
                    institutionDiscount = promo.maxAmount;
                }
                institutionDiscount = (institutionDiscount > priceBeforeDiscount) ? priceBeforeDiscount : institutionDiscount;
                discountValue = discountValue + institutionDiscount;
            } else {
                let institutionDiscount = (((priceBeforeDiscount - promo.discount) < 0) ? priceBeforeDiscount : promoCode.discount);
                discountValue = discountValue + institutionDiscount;
            }

        }

        console.log('discountValue institutions ', discountValue);
        return discountValue;
    }

}