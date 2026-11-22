import StoreKeeperHistory from "../../models/storekeeper-history.model/storekeeper-history.model.js";
import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkDateFilter } from "../../helpers/CheckMethods.js";
import i18n from 'i18n';
let populateQuery = [
    { path: 'warehouse', model: 'warehouse' },
];



export default {

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {warehouse, name,all,removeLanguage} = req.query;
            let query = { deleted: false };
            let sortQuery = { _id: -1 };

            checkDateFilter(req,query,sortQuery,true);
            if (name) query.name = { '$regex': name, '$options': 'i' };
            if (warehouse) query.warehouse = warehouse;

            let count = await StoreKeeperHistory.countDocuments(query);
            let pageCount = count;
            let keepers;
            if (all) {
                pageCount=1;
                limit = count;
                keepers = await StoreKeeperHistory.find(query).sort(sortQuery)
                    .populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                keepers = await StoreKeeperHistory.find(query).sort(sortQuery)
                .limit(limit).skip((page - 1) * limit)
                    .populate(populateQuery);
            }

            if (!removeLanguage) {
                keepers = StoreKeeperHistory.schema.methods.toJSONLocalizedOnly(keepers, i18n.getLocale());
            }
            
            res.send(new ApiResponse(keepers, page, pageCount, limit, count, req));

        } catch (err) {
            next(err);
        }
    },

    async create(data) {
        try {
            let storeKeeperHistory = await StoreKeeperHistory.create(data);
            // storeKeeperHistory = await StoreKeeperHistory.populate(storeKeeperHistory, populateQuery);
            // storeKeeperHistory = StoreKeeperHistory.schema.methods.toJSONLocalizedOnly(storeKeeperHistory, i18n.getLocale());
            
        } catch (err) {
            console.log('no history added.');
        }
    },

    async findById(req, res, next) {
        try {
            let { storeKeeperId } = req.params;
            let { removeLanguage } = req.query;
            let storeKeeperHistory = await checkExistThenGet(storeKeeperId, StoreKeeperHistory, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                storeKeeperHistory = StoreKeeperHistory.schema.methods.toJSONLocalizedOnly(storeKeeperHistory, i18n.getLocale());
            }
            res.status(200).send(storeKeeperHistory);

        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user;
            if (user.type != 'ADMIN' && user.type != 'SUB_ADMIN') {
                return next(new ApiError(403, i18n.__('admin.auth')));
            }
            let { storeKeeperId } = req.params;
            let storeKeeperHistory = await checkExistThenGet(storeKeeperId, StoreKeeperHistory, { deleted: false });
            
            storeKeeperHistory.deleted = true;
            await storeKeeperHistory.save();
            res.status(200).send("Deleted Successfully");

        }
        catch (err) {
            next(err);
        }
    }
}