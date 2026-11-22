import WalletTransactions from "../../models/wallet-transactions.model/wallet-transactions.model.js";
import ApiResponse from "../../helpers/ApiResponse.js";
import { checkExistThenGet } from "../../helpers/CheckMethods.js";
import i18n from 'i18n';
import moment from 'moment';

let populateQuery = [{path:'order',model:'order',populate:[]},{ path: 'user', model: 'user' }];


export default {

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;

            var {  month, year,user ,points,order} = req.query;
            let query = { deleted: false };

            if (user) query.user = user;
            if (points) query.points = points;
            if (order) query.order = order;

            let date = new Date();
            if (month && year) {
                month = month - 1;
                date.setMonth(month);
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('month');
                let endOfDate = moment(date).endOf('month');

                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            if (year && !month) {
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('year');
                let endOfDate = moment(date).endOf('year');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }

            let walletTransactions = await WalletTransactions.find(query).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).populate(populateQuery)
            const addressCount = await WalletTransactions.countDocuments(query);
            let pageCount = Math.ceil(addressCount / limit);
            walletTransactions = WalletTransactions.schema.methods.toJSONLocalizedOnly(walletTransactions, i18n.getLocale());

            res.send(new ApiResponse(walletTransactions, page, pageCount, limit, addressCount, req));

        } catch (err) {
            next(err);
        }
    },

    async create(user,points,order,type) {
        try {
            let validatedBody = {user,points,type};

            if(order){
                validatedBody.order=order;
            }
            
            
            await WalletTransactions.create(validatedBody);
        } catch (err) {
            console.log('create waalet transaction failed ',err);
        }
    },

    async findById(req, res, next) {
        try {
            let { walletTransactionId } = req.params;
            let walletTransaction = await checkExistThenGet(walletTransactionId, WalletTransactions, { deleted: false, populate: populateQuery });

            walletTransaction = WalletTransactions.schema.methods.toJSONLocalizedOnly(walletTransaction, i18n.getLocale());

            res.status(200).send(walletTransaction);

        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let { walletTransactionId } = req.params;
            let walletTransaction = await checkExistThenGet(walletTransactionId, WalletTransactions, { deleted: false });
            walletTransaction.deleted = true;
            await walletTransaction.save();
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    }

}