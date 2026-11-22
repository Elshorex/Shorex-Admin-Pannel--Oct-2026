import Request from "../../models/request.model/request.model.js";
import Driver from "../../models/user.model/user.model.js";
import User from "../../models/user.model/user.model.js";
import Vehicle from "../../models/vehicle.model/vehicle.model.js";
import areaModel from "../../models/area.model/area.model.js";
import countryModel from "../../models/country.model/country.model.js";
import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from "express-validator";
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from "i18n";
import warehouseModel from "../../models/warehouse.model/warehouse.model.js";
import productModel from "../../models/product.model/product.model.js";
import rewardedProductModel from "../../models/rewarded-products.model/rewarded-product.model.js";
import rewardPointsModel from "../../models/reward-points.model/reward-points.model.js";
import moment from "moment-timezone";


            let populateQuery = [
                { path: "provider", model: "user" },
                { path: "driver", model: "user" },
                { path: "storeKeeper", model: "user" }, // ✅ add this
                { path: "createdBy", model: "user" },
                { path: "vehicle", model: "vehicle" },
                {
                    path: "customer",
                    model: "user",
                    populate: [
                    { path: "country", model: "country" },
                    { path: "region", model: "region" },
                    { path: "city", model: "city" },
                    { path: "areas", model: "area" },
                    ],
                },
                { path: "warehouse", model: "warehouse" },
                { path: "product", model: "product" },
                // { path: "rewardedProducts", model: "rewardedProduct" },
                 {
                    path: "rewardedProducts",
                    populate: { path: "product", model: "rewardedProduct" }, // ✅ Correct nesting
                },
                { path: "country", model: "country" },
                { path: "region", model: "region" },
                { path: "city", model: "city" },
                { path: "areas", model: "area" },
                ];

            let calculatePoints = async (customer, product, quantity) => {
      
            try {
                let productPoints = 0,
                points = 0;
                let length = customer.specialReward.length;
                if (length) {
                for (let index = 0; index < length; index++) {
                    if (customer.specialReward[index].product == product.id) {
                    productPoints = customer.specialReward[index].reward;
                    }
                }
                }
                if (!productPoints) {
                productPoints = product.points;
                }
                points = quantity * productPoints;
                return { productPoints, points };
            } catch (error) {
                throw error;
            }
                                    };
            let getRequestId = async (customerId, customer) => {
                try {
                    // 🔹 Load customer with populated locations if not already provided
                    customer = customer
                    ? customer
                    : await checkExistThenGet(customerId, User, {
                        populate: [
                            { path: "country", model: "country" },
                            { path: "region", model: "region" },
                            { path: "city", model: "city" },
                            { path: "areas", model: "area" }, // ✅ multiple areas
                        ],
                        });

                    customer = customer.toJSON();

                    // 🔹 Safely handle multiple areas
                    const areaNames = (customer.areas || [])
                    .map(function (a) {
                        return a && a.name && a.name.en && a.name.en[0]
                        ? a.name.en[0]
                        : null;
                    })
                    .filter(function (n) {
                        return n !== null;
                    });

                    const areaInitial = areaNames.length > 0 ? areaNames[0] : "X";

                    // 🔹 Extract safe initials
                    const countryInitial =
                    customer.country && customer.country.name && customer.country.name.en
                        ? customer.country.name.en[0]
                        : "C";
                    const regionInitial =
                    customer.region && customer.region.name && customer.region.name.en
                        ? customer.region.name.en[0]
                        : "R";
                    const cityInitial =
                    customer.city && customer.city.name && customer.city.name.en
                        ? customer.city.name.en[0]
                        : "T";

                    // 🔹 Build request ID
                    return (
                    countryInitial +
                    regionInitial +
                    cityInitial +
                    areaInitial +
                    new Date().getTime()
                    );
                } catch (error) {
                    throw error;
                }
                                    };

            const getInprogressQuery = (query, tz = "UTC") => {
            const start = moment().tz(tz).startOf("day").utc().toDate();
            const end   = moment().tz(tz).add(2, "days").endOf("day").utc().toDate();

            query.pickupDate = { $gte: start, $lte: end };
            };

            const getFutureQuery = (query, tz = "UTC") => {
            const future = moment().tz(tz).add(2, "days").endOf("day").utc().toDate();
            query.pickupDate = { $gt: future };
            };

            let getHistoryQuery = (query) => {
            query.status = "DELIVERED";
                                   };
            const getFailedQuery = (query, tz = "UTC") => {
            const nowUTC = moment().utc().toDate();
            query.$or = [
                { status: "FAILED" },
                { status: "PENDING", pickupDate: { $lt: nowUTC } }
            ];
            };


export default {

    getInprogressQuery,getFutureQuery,getHistoryQuery,getFailedQuery,

            validateBody(isUpdate = false) {
                let validations;
                if (!isUpdate) {

                validations = [

                 body("customer")
                    .optional()
                    .notEmpty()
                    .withMessage(() => i18n.__("fieldRequired")),
                body("quality")
                        .not()
                        .optional()
                        .isEmpty()
                        .withMessage(() => i18n.__("filedRequired")),
                body("note").optional(),
                body("notes").optional(),
                body("cashAmount")
                        .not()
                        .optional()
                        .isEmpty()
                        .withMessage(() => i18n.__("filedRequired")),

                body("rewardSum")
                        .not()
                        .optional()
                        .isEmpty()
                        .withMessage(() => i18n.__("filedRequired")),

                body("driverNote")
                        .not()
                        .optional()
                        .isEmpty()
                        .withMessage(() => i18n.__("filedRequired")),


                  body("pickupDate")
                    .not()
                    .isEmpty()
                    .withMessage(() => i18n.__("filedRequired")),
                  body("location")
                    .not()
                    .isEmpty()
                    .withMessage(() => i18n.__("filedRequired")),
                  body("product")
                    .not()
                    .isEmpty()
                    .withMessage(() => i18n.__("filedRequired"))
                    .custom(async (value, { req }) => {
                      req.product = await checkExistThenGet(
                        value,
                        productModel,
                        {
                          deleted: false,
                        }
                      );
                      return true;
                    }),

                  body("quantity")
                    .not()
                    .isEmpty()
                    .withMessage(() => i18n.__("filedRequired")),
                    body("quality").optional().not().isEmpty().withMessage(() => i18n.__("filedRequired")),


                  body("rewardType")
                    .optional()
                    .not()
                    .isEmpty()
                    .withMessage(() => i18n.__("filedRequired"))
                    .custom((value) => {
                      const validTypes = ["CASH", "POINTS", "PRODUCTS"];
                      const arr = Array.isArray(value) ? value : [value];
                      arr.forEach((t) => {
                        if (!validTypes.includes(t)) {
                          throw new ApiError(400, i18n.__("invalidRewardType"));
                        }
                      });
                      return true;
                    }),
                    body("rewardedProducts")
                    .optional()
                    .isArray()
                    .withMessage(() => i18n.__("invalidType"))
                    .custom(async (values) => {
                        for (const item of values) {
                        if (!item.product || typeof item.product !== "number") {
                            throw new Error(i18n.__("invalidRewardedProductId"));
                        }
                        if (item.quantity && typeof item.quantity !== "number") {
                            throw new Error(i18n.__("invalidRewardedProductQuantity"));
                        }
                        await checkExistThenGet(item.product, rewardedProductModel, {
                            deleted: false,
                        });
                        }
                        return true;
                    }),
               
                  body("country")
                    .not()
                    .isEmpty()
                    .withMessage(() => i18n.__("filedRequired")),
                  body("region")
                    .not()
                    .isEmpty()
                    .withMessage(() => i18n.__("filedRequired")),
                  body("city")
                    .not()
                    .isEmpty()
                    .withMessage(() => i18n.__("filedRequired")),
                  body("areas")
                    .isArray({ min: 1 })
                    .withMessage(() => i18n.__("areasArrayRequired"))
                    .custom(async (values, { req }) => {
                    for (const id of values) {
                        await checkExistThenGet(id, areaModel, { deleted: false });
                    }
                    const warehouse = await warehouseModel.findOne({
                        areas: { $in: values },
                        deleted: false,
                    });

                    if (!warehouse)
                        throw new ApiError(400, i18n.__("warehouseNotFound"));

                    req.warehouse = warehouse;
                    return true;
                    }),
                ];
                } else {
                validations = [
                    body("product").optional().not().isEmpty().withMessage(() => i18n.__("filedRequired")).custom(async (value) => {
                        await checkExistThenGet(value, productModel, { deleted: false });
                        return true;
                    }),
                    body("quantity").optional().not().isEmpty().withMessage(() => i18n.__("filedRequired")),
                    body("quality").optional().not().isEmpty().withMessage(() => i18n.__("filedRequired")),
                    body("notes").optional(),
                ];
                }
                return validations;
            },

async findAll(req, res, next) {
    try {
        let page = +req.query.page || 1;
        let limit = +req.query.limit || 20;

        const {
            removeLanguage,
            all,
            warehouse,
            product,
            provider,
            customer,
            driver,
            vehicle,
            quantity,
            status,
            note,
            hasNoProvider,
            hasProvider,
            requestId,
            name,
            inprogress,
            future,
            history,
            failed,
            completed,
            filterDateKey,
            fromDateValue,
            toDateValue,
            tz
        } = req.query;

        const query = { deleted: false };
        const sortQuery = { pickupDate: -1 };

        // ---------------------------------------------------------------------
        // ✅ Timezone-safe date window (Client TZ → UTC DB)
        // ---------------------------------------------------------------------
        console.log(tz, 'tz')
        const timezone = tz || "UTC"
        const startOfTodayUTC = moment().tz(timezone).startOf("day").utc().toDate();
        const endOfTodayUTC   = moment().tz(timezone).endOf("day").utc().toDate();

        // ---------------------------------------------------------------------
        // ✅ Status logic (your exact business rules)
        // ---------------------------------------------------------------------
        if (status === "ON_THE_WAY") {
            query.$or = [
                { status: "ON_THE_WAY", pickupDate: { $lte: endOfTodayUTC } },
                { status: "PENDING", pickupDate: { $lte: endOfTodayUTC } }
            ];
        } 
        else if (status === "PENDING") {
            query.status = "PENDING";
            query.pickupDate = { $gt: endOfTodayUTC }; // strictly future only
        } 
        else if (status) {
            query.status = status;
        }

        // ---------------------------------------------------------------------
        // ✅ Generic Date Filter (filterDateKey / fromDateValue / toDateValue)
        // ---------------------------------------------------------------------
        if (filterDateKey && (fromDateValue || toDateValue)) {
            const dateQuery = {};

            if (fromDateValue && toDateValue) {
                const start = moment.tz(fromDateValue, timezone).startOf("day").utc().toDate();
                const end   = moment.tz(toDateValue, timezone).endOf("day").utc().toDate();
                dateQuery.$gte = start;
                dateQuery.$lte = end;
            } 
            else if (fromDateValue) {
                const start = moment.tz(fromDateValue, timezone).startOf("day").utc().toDate();
                dateQuery.$gte = start;
            } 
            else if (toDateValue) {
                const end = moment.tz(toDateValue, timezone).endOf("day").utc().toDate();
                dateQuery.$lte = end;
            }

            // Merge safely (do not override existing pickupDate logic)
            if (!query[filterDateKey]) query[filterDateKey] = {};
            Object.assign(query[filterDateKey], dateQuery);
        }

        // ---------------------------------------------------------------------
        // Existing filters
        // ---------------------------------------------------------------------
        if (warehouse) query.warehouse = warehouse;
        if (product) query.product = product;
        if (hasNoProvider && !warehouse) query.provider = null;
        if (hasProvider) query.provider = { $ne: null };
        if (provider) query.provider = provider;
        if (customer) query.customer = customer;
        if (driver) query.driver = driver;
        if (vehicle) query.vehicle = vehicle;
        if (quantity) query.quantity = quantity;

        if (note) query.note = { $regex: note, $options: "i" };
        if (requestId) query.requestId = requestId;

        // ---------------------------------------------------------------------
        // 🔍 Name search (merge with existing $or)
        // ---------------------------------------------------------------------
        if (name) {
            const customers = await User.find({
                deleted: false,
                $or: [
                    { name: { $regex: name, $options: "i" } },
                    { bussinessName: { $regex: name, $options: "i" } },
                    { postalCode: { $regex: name, $options: "i" } },
                ],
            }).distinct("_id");

            const nameConditions = [
                { requestId: { $regex: name, $options: "i" } },
                { customer: { $in: customers } },
            ];

            if (query.$or) {
                query.$and = [
                    { $or: query.$or },
                    { $or: nameConditions }
                ];
                delete query.$or;
            } else {
                query.$or = nameConditions;
            }
        }

        // ---------------------------------------------------------------------
        // 🔐 Role-based filtering (CRITICAL FIXES)
        // ---------------------------------------------------------------------
        const user = req.user;

        if (user.type === "DRIVER") {
            query.driver = user.id; // 🔥 critical ownership fix

            // Default driver dashboard behavior
            if (!status) {
                query.$or = [
                    { status: "ON_THE_WAY" },
                    { status: "PENDING", pickupDate: { $lte: endOfTodayUTC } }
                ];
            }
        }

        if (user.type === "STORE_KEEPER") {
            if (!Array.isArray(user.areas) || user.areas.length === 0) {
                return next(new ApiError(400, i18n.__("storeKeeperAreasNotFound")));
            }
            query.areas = { $in: user.areas };
        }

        // Customer should only see own requests
        if (user.type === "CUSTOMER") {
            query.customer = user.id;
        }

        // ---------------------------------------------------------------------
        // 📦 Fetch data
        // ---------------------------------------------------------------------
        const count = await Request.countDocuments(query);
        let requests;

        if (all) {
            requests = await Request.find(query).sort(sortQuery).populate(populateQuery);
        } else {
            requests = await Request.find(query)
                .sort(sortQuery)
                .limit(limit)
                .skip((page - 1) * limit)
                .populate(populateQuery);
        }

        const pageCount = all ? 1 : Math.ceil(count / limit);

        // ---------------------------------------------------------------------
        // 🌍 Localization
        // ---------------------------------------------------------------------
        if (!removeLanguage) {
            requests = Request.schema.methods.toJSONLocalizedOnly(
                requests,
                i18n.getLocale()
            );
        }

        return res.send(new ApiResponse(requests, page, pageCount, limit, count, req));
    } catch (err) {
        next(err);
    }
},


            async create(req, res, next) {
            try {
                const user = req.user;
                const validatedBody = checkValidations(req);
                validatedBody.createdBy = user.id;

            let customer,
                country,
                isDriver = false;

                // ✅ Check for customer
                if (!validatedBody.customer) {
                customer = user;
                validatedBody.customer = user.id;
                } else {
                customer = await User.findOne({
                    _id: validatedBody.customer,
                    deleted: false,
                });

                if (!customer) {
                    throw new ApiError(400, i18n.__("customerNotFound"));
                }

                req.customer = customer;
                validatedBody.createdByType = "DRIVER";
                validatedBody.driver = user;
                isDriver = true;
                }

                // ✅ Generate unique request ID
                validatedBody.requestId = await getRequestId(customer.id);
                validatedBody.originalQuantity = validatedBody.quantity;

                // ✅ Normalize rewardType array
                const rewardTypes = Array.isArray(validatedBody.rewardType)
                ? validatedBody.rewardType
                : [validatedBody.rewardType];
                validatedBody.rewardType = rewardTypes;

                // ✅ Calculate points & reward
                const pointsDetails = await calculatePoints(customer,req.product,validatedBody.quantity);
                validatedBody.gainedPoints = pointsDetails.points;
                validatedBody.productPoints = pointsDetails.productPoints;

                country = await checkExistThenGet(req.body.country, countryModel, { deleted: false });
                const rewardPoints = await rewardPointsModel.findOne({
                country: country._id,
                deleted: false,
                }).lean();
                if (!rewardPoints) {
                return next(new ApiError(404, i18n.__('notFound')));
                }

                const gainedReward =(validatedBody.gainedPoints / rewardPoints.point) * rewardPoints.amount;
                validatedBody.gainedReward = Number(gainedReward);

                // ✅ Initialize rewarded products if applicable
                if (rewardTypes.includes("PRODUCTS")) {
                validatedBody.rewardedProducts = validatedBody.rewardedProducts || [];
                }

                // ✅ Warehouse validation (from `req.warehouse` in validator)
                if (!req.warehouse) {
                throw new ApiError(400, i18n.__("warehouseNotFoundInArea"));
                }
                validatedBody.warehouse = req.warehouse.id;

                // ✅ StoreKeeper validation
                if (!req.warehouse.storeKeeper) {
                throw new ApiError(400, i18n.__("storeKeeperNotAssignedToWarehouse"));
                }
                validatedBody.storeKeeper = req.warehouse.storeKeeper;

                // ✅ Driver auto-assignment (find driver covering any of the selected areas)
                if (!isDriver) {
                const driver = await User.findOne({
                    type: "DRIVER",
                    areas: { $in: validatedBody.areas }, // ✅ now checks multiple
                    deleted: false,
                });

                if (!driver) {
                    throw new ApiError(400, i18n.__("noDriverFoundInWarehouseArea"));
                }

                validatedBody.driver = driver.id;
                }

                // ✅ Provider inheritance
                if (user.provider) {
                validatedBody.provider = user.provider;
                }

                // ✅ Create request record
                let request = await Request.create(validatedBody);
                request = Request.schema.methods.toJSONLocalizedOnly(
                request,
                i18n.getLocale()
                );

                res.status(200).send(request);
            } catch (err) {
                next(err);
            }
            },
           
            async update(req, res, next) {
            try {
                const { requestId } = req.params;
                const { removeLanguage } = req.query;

                // 1️⃣ Check if the request exists
                const request = await checkExistThenGet(requestId, Request, {
                deleted: false,
                populate: populateQuery,
                });
           
                let validatedBody = req.body;

                console.log("Incoming update body:", validatedBody);
                const updatedRequest = await Request.findByIdAndUpdate(
                requestId,
                { $set: validatedBody },
                { new: true }
                ).populate(populateQuery);

                // 5️⃣ Handle localization if required
                let response = updatedRequest;
                if (!removeLanguage) {
                response = Request.schema.methods.toJSONLocalizedOnly(
                    updatedRequest,
                    i18n.getLocale()
                );
                }

                res.status(200).send(response);
            } catch (err) {
                next(err);
            }
            },

            async cancel(req, res, next) {
                try {
                    let { requestId } = req.params;
                    let { notes } = req.body;
                    let user = req.user;
                    let { removeLanguage } = req.query;
                    
                    await checkExist(requestId, Request, { deleted: false });
                    let validatedBody = {status:'CANCELED',cancelDate:new Date(),notes};
                    let updatedrequest = await Request.findByIdAndUpdate(requestId, validatedBody, { new: true });
                    if (!removeLanguage)
                        updatedrequest = Request.schema.methods.toJSONLocalizedOnly(updatedrequest, i18n.getLocale());
                    res.status(200).send(updatedrequest);
                } catch (err) {
                    next(err);
                }
            },

            async onTheWay(req, res, next) {
                    try {
                    const { requestId } = req.params;
                    const user = req.user;
                    const { removeLanguage } = req.query;
                    const request = await checkExistThenGet(requestId, Request, {deleted: false});
                    console.log(request,'request')

                    if (!request) {
                    throw new ApiError(400, i18n.__("requestMissing"));
                    }
                   const updatedRequest = await Request.findByIdAndUpdate(requestId,
                                                {
                                                    $set: {
                                                    status: "ON_THE_WAY",
                                                    deliveryDate: new Date(),
                                                    },
                                                },{ new: true }
                                                );      

                    // 6️⃣ Prepare localized response
                    let response = updatedRequest;
                    if (!removeLanguage) {
                    response = Request.schema.methods.toJSONLocalizedOnly( updatedRequest,i18n.getLocale());
                    }
                    res.status(200).send(response);
                } catch (err) {
                    next(err);
                }
            },

            async delivered(req, res, next) {
                try {
                    let { requestId } = req.params;
                    let user = req.user;
                    let { removeLanguage } = req.query;
                    
                    console.log("hello")
                    await checkExist(requestId, Request, { deleted: false ,status:'ON_THE_WAY'});
                    let validatedBody = {status:'DELIVERED',deliveryDate:new Date()};
                    let updatedrequest = await Request.findByIdAndUpdate(requestId, validatedBody, { new: true });
                    if (!removeLanguage)
                        updatedrequest = Request.schema.methods.toJSONLocalizedOnly(updatedrequest, i18n.getLocale());
                    res.status(200).send(updatedrequest);
                } catch (err) {
                    next(err);
                }
            },

            async bulkDelivered(req, res, next) {
                    try {
                        let { requestIds } = req.body;
                        let user = req.user;
                        let { removeLanguage } = req.query;

                        if (!Array.isArray(requestIds) || requestIds.length === 0)
                        throw new ApiError(400, i18n.__("requestIdsRequired"));

                        // ✅ Check that at least one request exists and is ON_THE_WAY
                        const requests = await Request.find({
                        _id: { $in: requestIds },
                        deleted: false,
                        status: "ON_THE_WAY",
                        });

                        if (!requests || requests.length === 0)
                        throw new ApiError(404, i18n.__("noRequestsFound"));

                        // ✅ Update all valid requests
                        await Request.updateMany(
                        { _id: { $in: requestIds }, status: "ON_THE_WAY" },
                        { $set: { status: "DELIVERED", deliveryDate: new Date() } }
                        );

                        // ✅ Fetch updated documents
                        let updatedRequests = await Request.find({ _id: { $in: requestIds } });

                        if (!removeLanguage)
                        updatedRequests = updatedRequests.map((r) =>
                            Request.schema.methods.toJSONLocalizedOnly(r, i18n.getLocale())
                        );

                        res.status(200).send({ message: i18n.__("requestsUpdatedSuccessfully"),count: updatedRequests.length,data: updatedRequests});
                    } catch (err) {
                        next(err);
                    }
            },

            // async bulkCompleted(req, res, next) {
            //         try {
            //             let { requestIds } = req.body;
            //             let user = req.user;
            //             let { removeLanguage } = req.query;

            //             if (!Array.isArray(requestIds) || requestIds.length === 0)
            //             throw new ApiError(400, i18n.__("requestIdsRequired"));

            //             // ✅ Fetch all delivered requests
            //             // const requests = await Request.find({
            //             // _id: { $in: requestIds },
            //             // deleted: false,
            //             // status: "DELIVERED",
            //             // });
            //               const requests = await Request.find({
            //                 _id: { $in: requestIds },
            //                 deleted: false,
            //                 status: "DELIVERED",
            //             });
            //             console.log(requests,'requests')

            //             if (!requests || requests.length === 0)
            //             throw new ApiError(404, i18n.__("noDeliveredRequestsFound"));

            //             let updatedRequests = [];

            //             // ✅ Process each request sequentially (ensures wallet + points consistency)
            //             for (const reqItem of requests) {
            //             if (!reqItem.customer) {
            //                 console.warn(`Skipping request ${reqItem._id}: no customer found`);
            //                 continue;
            //             }

            //             // Fetch customer and reward country info
            //              const customer = await checkExistThenGet(reqItem.customer, User, { deleted: false });
            //              const warehouse = await checkExistThenGet(reqItem.warehouse, warehouseModel, { deleted: false });
            //              const country = await rewardPointsModel.findOne({
            //                 country: reqItem.country,
            //                 deleted: false,
            //                 }).lean();

            //             if (!country) {
            //                 console.warn(`Skipping request ${reqItem._id}: no reward config found`);
            //                 continue;
            //             }

            //             // Use frontend-provided or existing gainedPoints
            //             const gainedPoints = Number(reqItem.gainedPoints || 0);
            //             const pointsToMoney = (gainedPoints / country.point) * country.amount;

            //             // Update customer's wallet and points
            //             const customerPoints = (customer.points || 0) + gainedPoints;
            //             const customerWallet = (customer.wallet || 0) + pointsToMoney;

            //             await User.findByIdAndUpdate(customer._id, {
            //                 $set: {
            //                 points: customerPoints,
            //                 wallet: customerWallet,
            //                 pointsAdded: (customer.pointsAdded || 0) + gainedPoints,
            //                 walletAdded: (customer.walletAdded || 0) + pointsToMoney,
            //                 },
            //             });

            //               await warehouseModel.findByIdAndUpdate(reqItem.warehouse, {
            //                 $set: {
            //                     totalStock: warehouse.totalStock + reqItem.quantity || 0,
            //                 },
            //                 }); 

            //             // Update request to COMPLETED
            //             const validatedBody = {
            //                 status: "COMPLETED",
            //                 completedDate: new Date(),
            //                 gainedPoints,
            //             };

            //             let updatedRequest = await Request.findByIdAndUpdate(reqItem._id, validatedBody, { new: true });

            //             if (!removeLanguage)
            //                 updatedRequest = Request.schema.methods.toJSONLocalizedOnly(updatedRequest, i18n.getLocale());

            //             updatedRequests.push(updatedRequest);
            //             }

            //             res.status(200).send({
            //             message: i18n.__("requestsCompletedSuccessfully"),
            //             count: updatedRequests.length,
            //             data: updatedRequests,
            //             });
            //         } catch (err) {
            //             next(err);
            //         }
            // },

            // async completed(req, res, next) {
            //     try {
            //         let { requestId } = req.params;
            //         let user = req.user;
            //         let { removeLanguage } = req.query;
            //          const { gainedPoints,quality,quantity } = req.body; // optional frontend inputs
            //         // 1️⃣ Validate request existence and status
            //         const request = await checkExistThenGet(requestId, Request, {deleted: false});
            //         console.log(request,'request')

            //         if (!request.customer) {
            //         throw new ApiError(400, i18n.__("requestCustomerMissing"));
            //         }

            //         const customer = await checkExistThenGet(request.customer, User, {deleted: false});
            //         const warehouse = await checkExistThenGet(request.warehouse, warehouseModel, {deleted: false});
            //         const country = await checkExistThenGet(request.country, countryModel, {deleted: false});
            //         const rewardPoints = await rewardPointsModel.findOne({
            //         country: country._id,
            //         deleted: false,
            //         }).lean();

            //         if (!country) {
            //         throw new ApiError(400, i18n.__("requestCountryMissing"));
            //         }
            //         let pointsToMoney ;
            //         console.log(gainedPoints,'gainedPoints')
            //         if(gainedPoints) {
            //                   pointsToMoney = (gainedPoints / rewardPoints.point) * rewardPoints.amount;
            //         }else{
            //                  pointsToMoney = (request.gainedPoints / rewardPoints.point) * rewardPoints.amount;
            //         }

            //         // 4️⃣ Update customer wallet/points (frontend-calculated)
            //         const customerPoints = (customer.points || 0) + (gainedPoints || 0);
            //         const customerWallet = (customer.wallet || 0) + (pointsToMoney || 0);

            //         await User.findByIdAndUpdate(customer.id, {
            //         $set: {
            //             points: customerPoints,
            //             wallet: customerWallet,
            //             pointsAdded: (customer.pointsAdded || 0) + (gainedPoints || 0),
            //             walletAdded: (customer.walletAdded || 0) + (pointsToMoney || 0),
            //         },
            //         });           
                    
            //         // Update Warehouse Total Stock

            //         await warehouseModel.findByIdAndUpdate(request.warehouse, {
            //         $set: {
            //             totalStock: warehouse.totalStock + request.quantity || 0,
            //             requests: warehouse?.requests?.length === 0 ? request : [...warehouse?.requests,request] 
            //         },
            //         }); 

            //         await checkExist(requestId, Request, { deleted: false ,status:'DELIVERED'});
            //         let validatedBody = {status:'COMPLETED',completedDate:new Date(),gainedPoints:gainedPoints ? Number(gainedPoints) : Number(request.gainedPoints),quality:quality,quantity:quantity};
            //         let updatedrequest = await Request.findByIdAndUpdate(requestId, validatedBody, { new: true });
            //         if (!removeLanguage)
            //             updatedrequest = Request.schema.methods.toJSONLocalizedOnly(updatedrequest, i18n.getLocale());
            //         res.status(200).send(updatedrequest);
            //     } catch (err) {
            //         next(err);
            //     }
            // },
            async bulkCompleted(req, res, next) {
    try {
        let { requestIds } = req.body;
        let user = req.user;
        let { removeLanguage } = req.query;

        if (!Array.isArray(requestIds) || requestIds.length === 0)
            throw new ApiError(400, i18n.__("requestIdsRequired"));

        const requests = await Request.find({
            _id: { $in: requestIds },
            deleted: false,
            status: "DELIVERED",
        });

        if (!requests || requests.length === 0)
            throw new ApiError(404, i18n.__("noDeliveredRequestsFound"));

        let updatedRequests = [];

        for (const reqItem of requests) {

            if (!reqItem.customer) continue;

            const customer = await checkExistThenGet(reqItem.customer, User, { deleted: false });
            const country = await rewardPointsModel.findOne({
                country: reqItem.country,
                deleted: false,
            }).lean();

            if (!country) continue;

            const gainedPoints = Number(reqItem.gainedPoints || 0);
            const pointsToMoney = (gainedPoints / country.point) * country.amount;

            const finalQuantity = reqItem.quantity;

            // 1️⃣ Update customer
            await User.findByIdAndUpdate(customer._id, {
                $set: {
                    points: (customer.points || 0) + gainedPoints,
                    wallet: (customer.wallet || 0) + pointsToMoney,
                    pointsAdded: (customer.pointsAdded || 0) + gainedPoints,
                    walletAdded: (customer.walletAdded || 0) + pointsToMoney,
                },
            });

            // ✅ 2️⃣ ATOMIC warehouse stock update (FIXED)
            await warehouseModel.findByIdAndUpdate(
                reqItem.warehouse,
                {
                    $inc: { totalStock: finalQuantity },
                    $addToSet: { requests: reqItem._id }
                }
            );

            // 3️⃣ Mark completed
            let updatedRequest = await Request.findByIdAndUpdate(
                reqItem._id,
                {
                    status: "COMPLETED",
                    completedDate: new Date(),
                    gainedPoints,
                },
                { new: true }
            );

            if (!removeLanguage)
                updatedRequest = Request.schema.methods.toJSONLocalizedOnly(updatedRequest, i18n.getLocale());

            updatedRequests.push(updatedRequest);
        }

        res.status(200).send({
            message: i18n.__("requestsCompletedSuccessfully"),
            count: updatedRequests.length,
            data: updatedRequests,
        });

    } catch (err) {
        next(err);
    }
},

        
            async completed(req, res, next) {
    try {
        let { requestId } = req.params;
        let user = req.user;
        let { removeLanguage } = req.query;
        const { gainedPoints, quality, quantity } = req.body;

        // 1️⃣ Validate request
        const request = await checkExistThenGet(requestId, Request, { deleted: false });

        if (!request.customer) {
            throw new ApiError(400, i18n.__("requestCustomerMissing"));
        }

        await checkExist(requestId, Request, { deleted: false, status: 'DELIVERED' });

        const customer = await checkExistThenGet(request.customer, User, { deleted: false });
        const warehouse = await checkExistThenGet(request.warehouse, warehouseModel, { deleted: false });
        const country = await checkExistThenGet(request.country, countryModel, { deleted: false });

        const rewardPoints = await rewardPointsModel.findOne({
            country: country._id,
            deleted: false,
        }).lean();

        if (!country) {
            throw new ApiError(400, i18n.__("requestCountryMissing"));
        }

        let pointsToMoney;
        if (gainedPoints) {
            pointsToMoney = (gainedPoints / rewardPoints.point) * rewardPoints.amount;
        } else {
            pointsToMoney = (request.gainedPoints / rewardPoints.point) * rewardPoints.amount;
        }

        const finalPoints = gainedPoints ? Number(gainedPoints) : Number(request.gainedPoints);
        const finalQuantity = request.quantity; // quantity does not change (as confirmed)

        // 2️⃣ Update customer wallet/points
        await User.findByIdAndUpdate(customer._id, {
            $set: {
                points: (customer.points || 0) + finalPoints,
                wallet: (customer.wallet || 0) + (pointsToMoney || 0),
                pointsAdded: (customer.pointsAdded || 0) + finalPoints,
                walletAdded: (customer.walletAdded || 0) + (pointsToMoney || 0),
            },
        });

        // ✅ 3️⃣ ATOMIC warehouse stock update (FIXED)
        await warehouseModel.findByIdAndUpdate(
            request.warehouse,
            {
                $inc: { totalStock: finalQuantity },
                $addToSet: { requests: request._id }
            }
        );

        // 4️⃣ Mark request as completed
        let validatedBody = {
            status: 'COMPLETED',
            completedDate: new Date(),
            gainedPoints: finalPoints,
            quality: quality,
            quantity: quantity,
        };

        let updatedrequest = await Request.findByIdAndUpdate(requestId, validatedBody, { new: true });

        if (!removeLanguage)
            updatedrequest = Request.schema.methods.toJSONLocalizedOnly(updatedrequest, i18n.getLocale());

        res.status(200).send(updatedrequest);

    } catch (err) {
        next(err);
    }
},



            async failed(req, res, next) {
                try {
                    let { requestId } = req.params;
                    let user = req.user;
                    let { removeLanguage } = req.query;
                    
                    await checkExist(requestId, Request, { deleted: false /*,status:'ON_THE_WAY'*/});
                    let validatedBody = {status:'FAILED',failDate:new Date()};
                    let updatedrequest = await Request.findByIdAndUpdate(requestId, validatedBody, { new: true });
                    if (!removeLanguage)
                        updatedrequest = Request.schema.methods.toJSONLocalizedOnly(updatedrequest, i18n.getLocale());
                    res.status(200).send(updatedrequest);
                } catch (err) {
                    next(err);
                }
            },

            async findById(req, res, next) {
                try {
                    let { requestId } = req.params;
                    let { removeLanguage } = req.query;
                    let request = await checkExistThenGet(requestId, Request, { populate:populateQuery });
                    if (!removeLanguage) {
                        request = Request.schema.methods.toJSONLocalizedOnly(request, i18n.getLocale());
                    }
                    res.status(200).send(request);

                } catch (err) {
                    next(err);
                }
            },

            async delete(req, res, next) {
                try {
                    let user = req.user;
                    let { requestId } = req.params;
                    let request = await checkExistThenGet(requestId, Request, { deleted: false });
                    request.deleted = true;
                    await request.save();
                    res.status(200).send("Deleted Successfully");
                }
                catch (err) {
                    next(err);
                }
            },

            async inprogressCount(req, res, next) {
                try {
                    let {provider} = req.query;
                    let query = { deleted: false};

                    getInprogressQuery(query);

                    if (provider) {
                        query.provider = provider;
                    }
                    // let count = await Request.count(query);
                    let count = await Request.countDocuments(query);
                    res.send({ count });
                } catch (err) {
                    next(err);
                }
            },

            validateDeleteMulti() {
                return [
                    body('ids').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                        .isArray().withMessage(() => { return i18n.__('invalidType') })
                ];
            },


            async deleteMuti(req, res, next) {
                try {
                    let user = req.user;
                    if (!['ADMIN', 'SUB_ADMIN'].includes(user.type))
                        return next(new ApiError(403, i18n.__('unauthrized')));

                    let validatedBody = checkValidations(req);
                    let count = await Request.countDocuments({deleted:false,_id: { $in: validatedBody.ids }});
                    
                    if (count != validatedBody.ids.length  ) {
                        return next(new ApiError(403, i18n.__('invalidData')));
                    }
                    await Request.updateMany({ _id: { $in: validatedBody.ids }, deleted: false }, { deletedBy: user.id, deleted: true, deletedDate: new Date() })
                    res.status(200).send("Deleted Successfully");
                }
                catch (err) {
                    next(err);
                }
            },

            validateCreateRoute(){
                return [
                    body('pickupDate').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
                    body('product').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async(value)=>{
                        await checkExistThenGet(value,productModel,{deleted:false});
                        return true;
                    }),
                    body('driver').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async(value)=>{
                        await checkExistThenGet(value,Driver,{deleted:false});
                        return true;
                    }),
                    body('vehicle').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async(value)=>{
                        await checkExistThenGet(value,Vehicle,{deleted:false});
                        return true;
                    }),
                    body('customers').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).isArray(),
                ];
            },


            async routeCreate(req, res, next) {
                try {
                    let user = req.user;
                    let validatedBody = checkValidations(req);
                    // validatedBody.gainedPoints = validatedBody.quantity * 1;
                    // validatedBody.originalQuantity = validatedBody.quantity;
                    validatedBody.createdBy = user.id;
                    validatedBody.createdByType = 'ROUTE';
                    let result = [];

                    let length = validatedBody.customers.length;
                    let ids = validatedBody.customers.map(i=>i.id);
                    let customersCount = await User.count({deleted:false,type:'CLIENT',_id:{$in:ids}});

                    if (customersCount != length) {
                        return next(new ApiError(400, i18n.__('invalidData')));
                    }

                    for (let index = 0; index < length; index++) {
                        validatedBody.customer = validatedBody.customers[index].id;
                        validatedBody.requestId =  await getRequestId(validatedBody.customer);  // `${new Date().getTime()}`;
                        let request = await Request.create(validatedBody);
                        request = Request.schema.methods.toJSONLocalizedOnly(request, i18n.getLocale());
                        result.push(request);
                    }
                    
                    res.status(200).send({result});
                } catch (err) {
                    next(err);
                }
            },


            async availableStatus(req, res, next) {
                try {
                    let result = [
                        {id:'PENDING',name:{ar:"معلقة",en:"Pending",es:"Pendiente"}},
                        {id:'ON_THE_WAY',name:{ar:"في الطريق",en:"On the way",es:"En camino"}},
                        {id:'DELIVERED',name:{ar:"تم الانتهاء",en:"Finished",es:"Finalizada"}},
                        {id:'FAILED',name:{ar:"فاشل",en:"Failed",es:"Fallida"}},
                        {id:'CANCELED',name:{ar:"ملغاة",en:"Canceled",es:"Cancelada"}},
                    ]
                    res.status(200).send({result});
                } catch (err) {
                    next(err);
                }
            },

            async getProductCustomerPoints(req, res, next) {
            try {
                const { productId } = req.params;
                const { customerId } = req.query;
                
                // ✅ use logged-in user if no customerId is passed
                const userId = customerId || req.user._id;

                const customer = await checkExistThenGet(userId, User, { deleted: false });
                const product  = await checkExistThenGet(productId, productModel, { deleted: false }); 

                const result = await calculatePoints(customer, product, 1);
                res.status(200).send({ reward: result.productPoints });
            } catch (err) {
                next(err);
            }
            }
        }

