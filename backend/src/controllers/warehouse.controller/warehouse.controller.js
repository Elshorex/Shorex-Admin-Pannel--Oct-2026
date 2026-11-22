import User from "../../models/user.model/user.model.js";
import Product from "../../models/product.model/product.model.js";
import Warehouse from "../../models/warehouse.model/warehouse.model.js";
import Status from "../../models/status.model/status.model.js";
import storeKeeperController from "../../controllers/store-keeper.controller/store-keeper.controller.js";
import storeKeeperHistoryController from "../../controllers/storekeeper-history.controller/storekeeper-history.controller.js";


// ✅ Import models for validations
import Country from '../../models/country.model/country.model.js';
import Region from '../../models/region.model/region.model.js';
import City from '../../models/city.model/city.model.js';
import Area from '../../models/area.model/area.model.js';

import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import moment from 'moment'

let populateQuery = [
    // { path: 'status', model: 'status' },
    { path: 'provider', model: 'user' },
    { path: 'storeKeeper', model: 'user' },
    { path: "country", model: "country" },
    { path: "requests", model: "request" },
    { path: "region", model: "region", populate: { path: "country", model: "country" } },
    { path: "city", model: "city", populate: { path: "region", model: "region" } },
    { path: "areas", model: "area", populate: { path: "city", model: "city" } },
    { path: 'products.product', model: 'product' },
];



export default {


    validateStoreKeeper() {
        return [
            body('storeKeeper').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
            .custom(async(value,{req})=>{
                req.storeKeeper = await checkExistThenGet(value,User,{deleted:false,type : 'STORE_KEEPER'});
                return true;
            })
        ]
    },

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
                body('name').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (val, { req }) => {

                    let query = { name: val, deleted: false };
                    let exist = await Warehouse.findOne(query).lean();
                    if (exist)
                        throw new Error(i18n.__('duplicated'));
                    return true;
                }),
                body('address').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('notes').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('products').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('products.*.product').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async(value)=>{
                    await checkExist(value, Product, { deleted: false });
                    return true;
                }),
                body('products.*.stock').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('storeKeeperData').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),

                            body('country').not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                                .custom(async (val) => {
                                    await checkExist(val, Country, { deleted: false });
                                    return true;
                                }),
                
                           body('region').optional().isArray({ min: 1 }).withMessage(() => i18n.__('invalidType'))
                                .custom(async values => { 
                                    for (const id of values) await checkExist(id, Region, { deleted: false }); 
                                    return true; 
                                }),

                            body('requests').optional().isArray().withMessage(() => i18n.__('invalidType')),
                            body('city').optional().isArray({ min: 1 }).withMessage(() => i18n.__('invalidType'))
                                .custom(async values => { 
                                    for (const id of values) await checkExist(id, City, { deleted: false }); 
                                    return true; 
                                }),
                            body('areas').optional().isEmpty().withMessage(() => i18n.__('filedRequired')).isArray({ min: 1 }).withMessage(() => i18n.__('invalidType'))
                                .custom(async (values) => {
                                            for (let id of values) {
                                                await checkExist(id, Area, { deleted: false });
                                            }
                                            return true;
                                        }),
            body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') }),
            body('totalStock').optional().isInt({ min: 0 }).withMessage(() => { return i18n.__('invalidValue') })

            ];
        }
        else {
            validations = [
                body('name').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (val, { req }) => {

                    let query = { name: val, deleted: false, _id: { $ne: req.params.warehouseId } };
                    let exist = await Warehouse.findOne(query).lean();
                    if (exist)
                        throw new Error(i18n.__('duplicated'));
                    return true;
                }),
                body('address').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('notes').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('products').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('products.*.product').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async(value)=>{
                    await checkExist(value, Product, { deleted: false });
                    return true;
                }),
                body('products.*.stock').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                body('storeKeeper').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async(value,{req})=>{
                    req.storeKeeper = await checkExistThenGet(value,User,{deleted:false,type : 'STORE_KEEPER'});
                    return true;
                }),
                            body('country').optional().not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                                .custom(async (val) => {
                                    await checkExist(val, Country, { deleted: false });
                                    return true;
                                }),
                
                           
                           body('region').optional().isArray({ min: 1 }).withMessage(() => i18n.__('invalidType'))
                                .custom(async values => { 
                                    for (const id of values) await checkExist(id, Region, { deleted: false }); 
                                    return true; 
                                }),

                            body('requests').optional().isArray().withMessage(() => i18n.__('invalidType')),
                            body('city').optional().isArray({ min: 1 }).withMessage(() => i18n.__('invalidType'))
                                .custom(async values => { 
                                    for (const id of values) await checkExist(id, City, { deleted: false }); 
                                    return true; 
                                }),
                
                            body('areas')
                                .optional()
                                .isArray({ min: 1 }).withMessage(() => i18n.__('invalidType'))
                                .custom(async (values) => {
                                    for (let id of values) {
                                        await checkExist(id, Area, { deleted: false });
                                    }
                                    return true;
                                }),
                                 body('status').optional().isInt({ min: 0, max: 1 }).withMessage(() => { return i18n.__('invalidValue') }),
                                 body('totalStock').optional().isInt({ min: 0 }).withMessage(() => { return i18n.__('invalidValue') })

            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { name, address, provider, product, storeKeeper, all, 
                removeLanguage ,hasNoProvider,hasProvider,
                fromJoiningDate , toJoiningDate,
                country,region,city, areas
            } = req.query;
            let query = { deleted: false };
            let sortQuery = { _id: -1 };

            checkDateFilter(req, query, sortQuery, true);
            if (country) query.country = country;  // single
            if (region) query.region = { $in: Array.isArray(region) ? region : [region] };
            if (city) query.city = { $in: Array.isArray(city) ? city : [city] };
            if (areas) query.areas = { $in: Array.isArray(areas) ? areas : [areas] };
            if (hasNoProvider) query.provider = null;
            if (hasProvider) query.provider = {$ne:null};
            if (provider) query.provider = provider;
            if (product){
                if (Array.isArray(product)) {
                    query['products.product'] = {$in:product};
                }else {
                    query['products.product'] = product;
                }
            } 
            if (storeKeeper) query.storeKeeper = storeKeeper;
            if (name){
                let storeKeepers = await User.find({deleted:false,type:'STORE_KEEPER',name:{ '$regex': name, '$options': 'i' }}).distinct('_id');
                query.$or = [{name : { '$regex': name, '$options': 'i' }},{storeKeeper:{$in:storeKeepers}}] ;
            } 
            if (address) query.address = { '$regex': address, '$options': 'i' };

            if (fromJoiningDate && toJoiningDate) {
                let startOfDate = moment(fromJoiningDate).startOf('day');
                let endOfDate = moment(toJoiningDate).endOf('day');
                let storeKeepers = await User.find({type:'STORE_KEEPER',startAt:{ $gte: new Date(startOfDate), $lte: new Date(endOfDate) }}).distinct('_id');
                query.storeKeeper = {$in:storeKeepers};

            } else if (toJoiningDate && !fromJoiningDate) {
                let endOfDate = moment(toJoiningDate).endOf('day');
                let storeKeepers = await User.find({type:'STORE_KEEPER',startAt:{ $lte: new Date(endOfDate)  }}).distinct('_id');
                query.storeKeeper = {$in:storeKeepers};

            } else if (fromJoiningDate && !toJoiningDate) {
                let startOfDate = moment(fromJoiningDate).startOf('day');
                let storeKeepers = await User.find({type:'STORE_KEEPER',startAt:{ $gte: new Date(startOfDate)   }}).distinct('_id');
                query.storeKeeper = {$in:storeKeepers};
                
            }

            console.log('queryquery==> ',query);
            let count = await Warehouse.countDocuments(query);
            let pageCount = count;
            let warehouses;
            if (all) {
                pageCount = 1;
                limit = count;
                warehouses = await Warehouse.find(query).sort(sortQuery)
                    .populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                warehouses = await Warehouse.find(query).sort(sortQuery)
                    .limit(limit).skip((page - 1) * limit)
                    .populate(populateQuery);
            }

            if (!removeLanguage) {
                warehouses = Warehouse.schema.methods.toJSONLocalizedOnly(warehouses, i18n.getLocale());
            }

            res.send(new ApiResponse(warehouses, page, pageCount, limit, count, req));

        } catch (err) {
            next(err);
        }
    },

    // async create(req, res, next) {
    //     try {
    //         let user = req.user;
    //         let validatedBody = checkValidations(req);
    //         console.log('validatedBody ',validatedBody);
    //         if (validatedBody.storeKeeperData) {
    //             if (user.type == 'PROVIDER') {
    //                 validatedBody.storeKeeperData.provider = user.id;  
    //             }
    //             req.storeKeeper = await storeKeeperController.create(validatedBody.storeKeeperData,user);
    //             validatedBody.startAt = validatedBody.storeKeeperData.startAt;
    //         }else{
    //             validatedBody.startAt = new Date()
    //         }
    //         validatedBody.storeKeeper = req.storeKeeper.id;
    //         if (user.type == 'PROVIDER') {
    //             validatedBody.provider = user.id;  
    //         }
            
    //         validatedBody.region =validatedBody.storeKeeperData.region || [];
    //         validatedBody.city =  validatedBody.storeKeeperData.city || [];
    //         validatedBody.areas = validatedBody.storeKeeperData.areas || [];



    //         let warehouse = await Warehouse.create(validatedBody);
    //         warehouse = await Warehouse.populate(warehouse, populateQuery);
    //         warehouse = Warehouse.schema.methods.toJSONLocalizedOnly(warehouse, i18n.getLocale());
    //         res.status(200).send(warehouse);
    //     } catch (err) {
    //         next(err);
    //     }
    // },

    async create(req, res, next) {
    try {
        let user = req.user;
        let validatedBody = checkValidations(req);
        let storeKeeperAreas = [];

        // storeKeeperData is now required
        if (user.type === "PROVIDER") {
            validatedBody.storeKeeperData.provider = user.id;
        }

        // Create new storekeeper (always)
        req.storeKeeper = await storeKeeperController.create(validatedBody.storeKeeperData, user)

        validatedBody.storeKeeper = req.storeKeeper.newStoreKeeper._id;

        validatedBody.startAt = validatedBody.storeKeeperData.startAt;
        storeKeeperAreas = validatedBody.storeKeeperData.areas || [];

        // validatedBody.storeKeeper = req.storeKeeper.id;

        if (user.type === "PROVIDER") {
            validatedBody.provider = user.id;
        }

        validatedBody.region = validatedBody.storeKeeperData?.region || [];
        validatedBody.city = validatedBody.storeKeeperData?.city || [];
        validatedBody.areas = validatedBody.storeKeeperData?.areas || [];

        // ---------------------------------------------------------------
        // ⭐ NEW LOGIC — Fetch Storekeepers in the SAME areas (FULL OBJECTS)
        // ---------------------------------------------------------------

        let existingStoreKeepers = [];
        let conflictMessage = null;

        if (storeKeeperAreas.length > 0) {
            existingStoreKeepers = await Warehouse.find({
                deleted: false,
                areas: { $in: storeKeeperAreas },
                // _id: { $ne: req.storeKeeper.id } // exclude the one we just created
            })
                .populate([
                    { path: "provider", select: "name" },
                    { path: "region", select: "name" },
                    { path: "city", select: "name" },

                    // FULL AREA OBJECTS
                    { path: "areas", select: "name region city" }
                ]);

            const activeWarehouseNames = existingStoreKeepers
                                        ?.filter(w => w.deleted === false)      // or w.status === "ACTIVE"
                                        .map(w => w.name)
                                        .join(", ");

            const activeAreasNames =   req.storeKeeper?.newStoreKeeper?.areas
                                        ?.filter(w => w.deleted === false)      // or w.status === "ACTIVE"
                                        .map(w => w.name)
                                        .join(", ");

            if (existingStoreKeepers.length > 0) {
                conflictMessage = `Warehouse is currently inactive, you have to deactivate the previous warehouses to make this warehouse active.
                                   Currently Active Warehouses: ${activeWarehouseNames} . You need to remove the Areas :- ${activeAreasNames} from 
                                   those Warehouse or Deactivate them to Activate this warehouse.
                `;
            }
        }
        // ---------------------------------------------------------------
        // CREATE WAREHOUSE
        // ---------------------------------------------------------------
        let warehouse = await Warehouse.create(validatedBody);
        warehouse = await Warehouse.populate(warehouse, populateQuery);
        // warehouse = Warehouse.schema.methods.toJSONLocalizedOnly(warehouse, i18n.getLocale());

        // ---------------------------------------------------------------
        // FINAL RESPONSE
        // ---------------------------------------------------------------
        return res.status(200).send({
                    message: conflictMessage,     // null OR string
                    warehouse: warehouse,    
                    newStoreKeeper: req.storeKeeper,        // Always return storekeeper
                    existingStoreKeepers: storeKeeperAreas.length > 0 ? existingStoreKeepers : [] // Return old driver(s) separately
        });

    } catch (err) {
        next(err);
    }
},

    async update(req, res, next) {
        try {
            let { warehouseId } = req.params;
            let { removeLanguage } = req.query;
            let user = req.user;

            await checkExist(warehouseId, Warehouse, { deleted: false });
            let validatedBody = checkValidations(req);
            if (validatedBody.storeKeeperData) {
                    await storeKeeperController.updateUser(
                        {
                            body: { storeKeeperData: validatedBody.storeKeeperData }
                        },
                        {
                            status: () => ({
                                send: () => {}
                            })
                        },
                        () => {}
                    );
                }

          if (validatedBody.storeKeeperData) {  validatedBody.region =validatedBody.storeKeeperData.region || []};
         if (validatedBody.city) {   validatedBody.city =  validatedBody.storeKeeperData.city || []};
          if (validatedBody.areas) {   validatedBody.areas = validatedBody.storeKeeperData.areas || []};
            
            // If status is being updated, sync it with the storekeeper
            if (validatedBody.status !== undefined) {
                let warehouse = await checkExistThenGet(warehouseId, Warehouse, { deleted: false });
                if (warehouse.storeKeeper) {
                    await User.findByIdAndUpdate(warehouse.storeKeeper, { status: validatedBody.status });
                }
            }
            
            let updatedWarehouse = await Warehouse.findByIdAndUpdate(warehouseId, validatedBody, { new: true }).populate(populateQuery);
            if (!removeLanguage)
                updatedWarehouse = Warehouse.schema.methods.toJSONLocalizedOnly(updatedWarehouse, i18n.getLocale());
            res.status(200).send(updatedWarehouse);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { warehouseId } = req.params;
            let { removeLanguage } = req.query;
            let warehouse = await checkExistThenGet(warehouseId, Warehouse, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                warehouse = Warehouse.schema.methods.toJSONLocalizedOnly(warehouse, i18n.getLocale());
            }
            res.status(200).send(warehouse);

        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user;
            
            let { warehouseId } = req.params;
            let warehouse = await checkExistThenGet(warehouseId, Warehouse, { deleted: false ,populate:populateQuery});
            
            let isKeeperDeleted = false;
            
            let keeper = warehouse.storeKeeper;
            if (keeper) {
                let keeperWarehouse = await Warehouse.findOne({deleted:false,_id:{$ne:warehouseId},storeKeeper:keeper._id})
                if (! keeperWarehouse) {
                    // Use findByIdAndUpdate to actually delete the storekeeper in database
                    await User.findByIdAndUpdate(keeper._id, { deleted: true });
                    isKeeperDeleted = true;
                } 
            }
            
            // Delete warehouse
            warehouse.deleted = true;
            await warehouse.save();

            let result = { isKeeperDeleted , message: isKeeperDeleted ? i18n.__('keeperDeleted') : i18n.__('keeperLinkDeleted') }
            res.status(200).send(result);

        }
        catch (err) {
            next(err);
        }
    },

    ////////////////////////////////  store keeper

    async removeStoreKeeper(req, res, next) {
        try {
            let { warehouseId } = req.params;
            let { removeLanguage } = req.query;
            let user = req.user;
            let warehouse = await checkExistThenGet(warehouseId, Warehouse, { deleted: false ,populate:populateQuery});

            let isKeeperDeleted = false;
            let keeper = warehouse.storeKeeper ;
            if (!keeper) {
                return next(new ApiError(404,i18n.__('keeperNotExist')));
            }
            let keeperWarehouse = await Warehouse.findOne({deleted:false,_id:{$ne:warehouseId},storeKeeper:keeper.id})
            if (! keeperWarehouse) {
                keeper.deleted = true;
                await keeper.save();
                isKeeperDeleted = true;
            }
            

            warehouse = Warehouse.schema.methods.toJSONLocalizedOnly(warehouse, i18n.getLocale());
            console.log('warehouse.storeKeeper ',warehouse.storeKeeper);
            
            await storeKeeperHistoryController.create({
                warehouse:warehouseId,
                startAt:warehouse.startAt,
                endAt:new Date(),
                name:warehouse.storeKeeper.name,
                phone:warehouse.storeKeeper.phone,
                email:warehouse.storeKeeper.email
                
            });

            let validatedBody = {$unset:{storeKeeper:1}};
            let updatedWarehouse = await Warehouse.findByIdAndUpdate(warehouseId, validatedBody, { new: true }).populate(populateQuery);
            
            updatedWarehouse = Warehouse.schema.methods.toJSONLocalizedOnly(updatedWarehouse, i18n.getLocale());

            let result = {...updatedWarehouse, isKeeperDeleted , message: isKeeperDeleted ? i18n.__('keeperDeleted') : i18n.__('keeperLinkDeleted') }
            
            res.status(200).send(result);
        } catch (err) {
            next(err);
        }
    },

    async changeStoreKeeper(req, res, next) {
        try {
            let { warehouseId } = req.params;
            let { removeLanguage } = req.query;
            let user = req.user;

            let warehouse = await checkExistThenGet(warehouseId, Warehouse, { deleted: false , populate:populateQuery });
            warehouse = Warehouse.schema.methods.toJSONLocalizedOnly(warehouse, i18n.getLocale());
            let validatedBody = checkValidations(req);

            if (validatedBody.storeKeeperData) {
                if (user.type == 'PROVIDER') {
                    validatedBody.storeKeeperData.provider = user.id;  
                }

                req.storeKeeper = await storeKeeperController.create(validatedBody.storeKeeperData);
                validatedBody.startAt = validatedBody.storeKeeperData.startAt;
            }else{
                validatedBody.startAt = new Date();
            }

            if (warehouse.storeKeeper) {
                await storeKeeperHistoryController.create({
                    warehouse:warehouseId,
                    startAt:warehouse.startAt,
                    endAt:new Date(),
                    name:warehouse.storeKeeper.name,
                    phone:warehouse.storeKeeper.phone,
                    email:warehouse.storeKeeper.email
                    // ...warehouse.storeKeeper
                });
            }

            
            
            let updatedWarehouse = await Warehouse.findByIdAndUpdate(warehouseId, {storeKeeper:req.storeKeeper.id}, { new: true }).populate(populateQuery);
            updatedWarehouse = Warehouse.schema.methods.toJSONLocalizedOnly(updatedWarehouse, i18n.getLocale());

            

            
            res.status(200).send(updatedWarehouse);
        } catch (err) {
            next(err);
        }
    },


// async getWarehouseStock(req, res, next) {
//     try {
//         let { warehouseId } = req.params;
//         let page = +req.query.page || 1;
//         let limit = +req.query.limit || 20;
//         let { name, address, storeKeeper, removeLanguage, customer, region, city, areas } = req.query;

//         // Fetch warehouse with full requests populated
//         let warehouse = await checkExistThenGet(warehouseId, Warehouse, {
//             deleted: false,
//             populate: [
//                 { path: "requests", populate: [
//                     { path: "storeKeeper", model: "user" },
//                     { path: "product", model: "product" },
//                     { path: "areas", model: "area" },
//                     { path: "city", model: "city" },
//                     { path: "region", model: "region" },
//                 ] }
//             ]
//         });

//         if (!warehouse) return next(new ApiError(404, "Warehouse not found"));

//         // Convert localized names
//         if (!removeLanguage) {
//             warehouse = Warehouse.schema.methods.toJSONLocalizedOnly(warehouse, i18n.getLocale());
//         }

//         // Filter requests in memory
//         let filteredRequests = warehouse.requests || [];

//         if (customer) filteredRequests = filteredRequests.filter(r => r.customer.toString() === customer);
//         if (storeKeeper) filteredRequests = filteredRequests.filter(r => r.storeKeeper?.id.toString() === storeKeeper);
//         if (region) filteredRequests = filteredRequests.filter(r => region.includes(r.region?.id.toString()));
//         if (city) filteredRequests = filteredRequests.filter(r => city.includes(r.city?.id.toString()));
//         if (areas) filteredRequests = filteredRequests.filter(r => areas.includes(r.areas?.id.toString()));
//         if (name) filteredRequests = filteredRequests.filter(r => 
//             r.name?.toLowerCase().includes(name.toLowerCase()) ||
//             r.storeKeeper?.name?.toLowerCase().includes(name.toLowerCase())
//         );

//         // Pagination
//         const totalCount = filteredRequests.length;
//         const paginatedRequests = filteredRequests.slice((page - 1) * limit, page * limit);

//         res.status(200).send({
//             warehouse: { ...warehouse.toObject(), requests: paginatedRequests },
//             totalCount,
//             page,
//             pageCount: Math.ceil(totalCount / limit),
//             limit
//         });
//     } catch (err) {
//         next(err);
//     }
// }

async getWarehouseStock(req, res, next) {
    try {
        let { warehouseId } = req.params;
        let page = +req.query.page || 1;
        let limit = +req.query.limit || 20;
        let { name, storeKeeper, customer, region, city, areas, removeLanguage } = req.query;

        // Fetch warehouse with full requests populated
        let warehouse = await checkExistThenGet(warehouseId, Warehouse, {
            deleted: false,
            populate: [
                { path: "requests", populate: [
                    { path: "storeKeeper", model: "user" },
                    { path: "product", model: "product" },
                    { path: "areas", model: "area" },
                    { path: "city", model: "city" },
                    { path: "region", model: "region" },
                    { path: "customer", model: "user" },
                    { path: "driver", model: "user" },
                ] }
            ]
        });

        if (!warehouse) return next(new ApiError(404, "Warehouse not found"));

        // Convert localized names
        if (!removeLanguage) {
            warehouse = Warehouse.schema.methods.toJSONLocalizedOnly(warehouse, i18n.getLocale());
        }

        // Filter requests in memory
        let requests = warehouse.requests || [];

        if (customer) requests = requests.filter(r => r.customer?.id.toString() === customer);
        if (storeKeeper) requests = requests.filter(r => r.storeKeeper?.id.toString() === storeKeeper);
        if (region) requests = requests.filter(r => region.includes(r.region?.id.toString()));
        if (city) requests = requests.filter(r => city.includes(r.city?.id.toString()));
        if (areas) requests = requests.filter(r => areas.includes(r.areas?.id.toString()));
        if (name) requests = requests.filter(r =>
            r.name?.toLowerCase().includes(name.toLowerCase()) ||
            r.storeKeeper?.name?.toLowerCase().includes(name.toLowerCase())
        );

        // Pagination
        const totalCount = requests.length;
        const paginatedRequests = requests.slice((page - 1) * limit, page * limit);

        // Return requests as top-level array
        res.status(200).send({
            data: paginatedRequests,
            totalCount,
            page,
            pageCount: Math.ceil(totalCount / limit),
            limit
        });

    } catch (err) {
        next(err);
    }
}






}