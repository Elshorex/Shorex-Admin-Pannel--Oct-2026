import Stock from "../../models/warehouse.model/warehouse.model.js";

import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations, handleImg } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import dotObject from 'dot-object'




export default {

    

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {  removeLanguage,name,storeKeeper ,provider,hasNoProvider,hasProvider,hasStock ,warehouse, emptyStock,product} = req.query;
            let query = { deleted: false };
            let matchQuery = {}
            let sortQuery = { createdAt: -1 }
            checkDateFilter(req,query,sortQuery,true);

            if (name) query.name = { '$regex': name, '$options': 'i' };
            if (hasNoProvider) query.provider = null;
            if (hasProvider) query.provider = {$ne:null};
            if (provider) query.provider = + provider;
            if (warehouse) query._id = + warehouse;
            if (storeKeeper) query.storeKeeper = + storeKeeper;



            if (hasStock) {
                matchQuery['products.stock'] = {$gt:0};
            }
            if (emptyStock) {
                matchQuery['products.stock'] = {$eq:0};
            }
            if (product) {
                matchQuery['products.product'] = + product;
            }

            // let data =  await Stock.aggregate([
            //     { $match: query },
            //     {
            //         $lookup: {
            //             from: 'users',
            //             localField: 'storeKeeper',
            //             foreignField: '_id',
            //             as: 'storeKeeper'
            //         }
            //     },
            //     {
            //         $unwind:{
            //             path: "$storeKeeper",
            //             preserveNullAndEmptyArrays: true
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: 'users',
            //             localField: 'provider',
            //             foreignField: '_id',
            //             as: 'provider'
            //         }
            //     },
            //     {
            //         $unwind:{
            //             path: "$provider",
            //             preserveNullAndEmptyArrays: true
            //         }
            //     },
            //     {
            //         $unwind: {
            //             path: '$products',
            //             preserveNullAndEmptyArrays: true
            //         }  
            //     },
            //     { $match: matchQuery},
            //     {
            //         $lookup: {
            //             from: 'products',
            //             localField: 'products.product',
            //             foreignField: '_id',
            //             as: 'product'
            //         }
            //     },
            //     {
            //         $unwind:'$product'
            //     },
            //      {
            //     $lookup: {
            //         from: "requests",
            //         localField: "warehouse.requests",
            //         foreignField: "_id",
            //         as: "requests"
            //     }
            // },
            //     {
            //         $facet: {
            //             data: [
            //                 { $sort: { '_id': -1 } },
            //                 { $skip: ((page - 1) * limit) },
            //                 { $limit: limit }
            //             ],
            //             pageInfo: [   { $group: { _id: null, count: { $sum: 1 } } }]
            //         },
            //     },
            // ]);
            let data = await Stock.aggregate([
    { $match: query },

    // -------------------------
    // JOIN STOREKEEPER
    // -------------------------
    {
        $lookup: {
            from: 'users',
            localField: 'storeKeeper',
            foreignField: '_id',
            as: 'storeKeeper'
        }
    },
    { $unwind: { path: "$storeKeeper", preserveNullAndEmptyArrays: true } },

    // -------------------------
    // JOIN PROVIDER
    // -------------------------
    {
        $lookup: {
            from: 'users',
            localField: 'provider',
            foreignField: '_id',
            as: 'provider'
        }
    },
    { $unwind: { path: "$provider", preserveNullAndEmptyArrays: true } },

    // -------------------------
    // UNWIND PRODUCTS FOR FILTERING
    // -------------------------
    {
        $unwind: {
            path: "$products",
            preserveNullAndEmptyArrays: true
        }
    },

    { $match: matchQuery },

    // -------------------------
    // JOIN PRODUCT DETAILS
    // -------------------------
    {
        $lookup: {
            from: 'products',
            localField: 'products.product',
            foreignField: '_id',
            as: 'product'
        }
    },
    { $unwind: "$product" },

    // -------------------------
    // JOIN WAREHOUSE
    // -------------------------
    {
        $lookup: {
            from: "warehouses",
            localField: "_id",
            foreignField: "_id",
            as: "warehouse"
        }
    },
    {
        $unwind: {
            path: "$warehouse",
            preserveNullAndEmptyArrays: true
        }
    },

    // -------------------------
    // JOIN REQUESTS FROM WAREHOUSE
    // warehouse.requests = [id1, id2, ...]
    // -------------------------
    {
        $lookup: {
            from: "requests",
            localField: "warehouse.requests",
            foreignField: "_id",
            as: "requests"
        }
    },

    // -------------------------
    // PAGINATION + COUNT
    // -------------------------
    {
        $facet: {
            data: [
                { $sort: { '_id': -1 } },
                { $skip: ((page - 1) * limit) },
                { $limit: limit }
            ],
            pageInfo: [
                { $group: { _id: null, count: { $sum: 1 } } }
            ]
        }
    }
]);
            let stockCount = data[0].pageInfo.length > 0 ? data[0].pageInfo[0].count : 0;
            let pageCount = Math.ceil(stockCount / limit);
            // Final data array
            let result = data[0].data;

            // Always ensure requests is an array
            result = result.map(item => ({
                ...item,
                requests: Array.isArray(item.requests) ? item.requests : []
            }));
            res.send(new ApiResponse(result, page, pageCount, limit, stockCount, req));

        } catch (err) {
            next(err);
        }
    },


    async clearStock(req,res,next){
        try {
            let { productId,warehouseId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;
            let warehouse =  await checkExistThenGet(warehouseId, Stock, { deleted: false });
            let length = warehouse.products.length;
            let found = false;
            for (let index = 0; index < length; index++) {
                if (warehouse.products[index].product == productId ) {
                    warehouse.products[index].stock = 0;
                    await warehouse.save()
                    found = true;
                    break;
                }
            }
            if (!found) {
                return next(new ApiError(404,i18n.__('productNotExist')));
            }
            if (!removeLanguage)
                warehouse = Stock.schema.methods.toJSONLocalizedOnly(warehouse, i18n.getLocale());
            res.status(200).send({warehouse});
        } catch (error) {
            next(error)
        }
    }

    
}