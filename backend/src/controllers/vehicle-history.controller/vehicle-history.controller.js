import VehicleHistory from "../../models/vehicle-history.model/vehicle-history.model.js";
import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkDateFilter } from "../../helpers/CheckMethods.js";
import i18n from 'i18n';
let populateQuery = [
    { path: 'vehicle', model: 'vehicle' },
    { path: 'driver', model: 'user' },
];



export default {

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {vehicle,driver,all,removeLanguage} = req.query;
            let query = { deleted: false };
            let sortQuery = { _id: -1 };

            checkDateFilter(req,query,sortQuery,true);
           
            if (vehicle) query.vehicle = vehicle;
            if (driver) query.driver = driver;

            let count = await VehicleHistory.countDocuments(query);
            let pageCount = count;
            let keepers;
            if (all) {
                pageCount=1;
                limit = count;
                keepers = await VehicleHistory.find(query).sort(sortQuery)
                    .populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                keepers = await VehicleHistory.find(query).sort(sortQuery)
                .limit(limit).skip((page - 1) * limit)
                    .populate(populateQuery);
            }

            if (!removeLanguage) {
                keepers = VehicleHistory.schema.methods.toJSONLocalizedOnly(keepers, i18n.getLocale());
            }
            
            res.send(new ApiResponse(keepers, page, pageCount, limit, count, req));

        } catch (err) {
            next(err);
        }
    },

    async create(data) {
        try {
            console.log(data);
            let vehicleHistory = await VehicleHistory.create(data);
            
        } catch (err) {
            console.log('no driver history added.');
        }
    },

    async findById(req, res, next) {
        try {
            let { historyId } = req.params;
            let { removeLanguage } = req.query;
            let vehicleHistory = await checkExistThenGet(historyId, VehicleHistory, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                vehicleHistory = VehicleHistory.schema.methods.toJSONLocalizedOnly(vehicleHistory, i18n.getLocale());
            }
            res.status(200).send(vehicleHistory);

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
            let { historyId } = req.params;
            let vehicleHistory = await checkExistThenGet(historyId, VehicleHistory, { deleted: false });
            
            vehicleHistory.deleted = true;
            await vehicleHistory.save();
            res.status(200).send("Deleted Successfully");

        }
        catch (err) {
            next(err);
        }
    }
}