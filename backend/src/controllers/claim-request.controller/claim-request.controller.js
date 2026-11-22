// import ClaimRequest from "../../models/claim-request.model/claim-request.model.js";
// import User from "../../models/user.model/user.model.js";
// import ApiResponse from "../../helpers/ApiResponse.js";
// import ApiError from "../../helpers/ApiError.js";
// import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
// import { body } from 'express-validator';
// import { checkValidations } from "../shared.controller/shared.controller.js";
// import i18n from 'i18n';
// import userModel from "../../models/user.model/user.model.js";
// import rewardPointsModel from "../../models/reward-points.model/reward-points.model.js";



// let populateQuery = [
//     { path: 'provider', model: 'user' },
//     {
//                     path: "customer",
//                     model: "user",
//                     populate: [
//                     { path: "country", model: "country" },
//                     { path: "region", model: "region" },
//                     { path: "city", model: "city" },
//                     { path: "areas", model: "area" },
//                     ],
//    },
// ];


// export default {

//     validateBody(isUpdate = false) {
//         let validations
//         if (!isUpdate) {
//             validations = [
//                 body('redeemAmount').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
//                 body('donationAmount').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }),
//                 body('customer').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
//                     .custom(async (value) => {
//                         await checkExistThenGet(value, User, { deleted: false });
//                         return true;
//                     })
//             ];
//         }
//         else {
//             validations = [

//             ];

//         }
//         return validations;
//     },

//     async findAll(req, res, next) {
//         try {
//             let page = +req.query.page || 1, limit = +req.query.limit || 20;
//             let { removeLanguage, all, provider, customer,status,  hasNoProvider, hasProvider,
//                 bussinessName,customerName,
//                 search
//             } = req.query;
//             let query = { deleted: false };
//             let sortQuery = { pickupDate: -1 }
//             checkDateFilter(req, query, sortQuery);


//             if (hasNoProvider) query.provider = null;
//             if (hasProvider) query.provider = { $ne: null };
//             if (provider) {
//                 query.provider = provider
//             }

//             if (bussinessName) {
//                 let ids = await User.find({deleted:false,type:"CLIENT",bussinessName:{ '$regex': bussinessName, '$options': 'i' }}).distinct('_id');
//                 query.customer = {$in:ids};
//             }
//             if (customerName) {
//                 let ids = await User.find({deleted:false,type:"CLIENT",name:{ '$regex': customerName, '$options': 'i' }}).distinct('_id');
//                 query.customer = {$in:ids};
//             }
//             if (search) {
//                 let ids = await User.find({deleted:false,type:"CLIENT", $or:[{name:{ '$regex': search, '$options': 'i' }},{bussinessName:{ '$regex': search, '$options': 'i' }}] }).distinct('_id');
//                 query.customer = {$in:ids};
//             }

//             if (customer) {
//                 query.customer = customer
//             }
//             if (status) {
//                 query.status = status
//             }
            

//             let requests;
//             console.log('query ',query);
            
//             // let count = await ClaimRequest.count(query);
//             let count = await ClaimRequest.countDocuments(query);
//             let pageCount = count;
//             if (all) {
//                 pageCount = 1;
//                 limit = count;
//                 requests = await ClaimRequest.find(query).sort(sortQuery).populate(populateQuery);
//             }
//             else {
//                 pageCount = Math.ceil(count / limit);
//                 requests = await ClaimRequest.find(query).sort(sortQuery).limit(limit).skip((page - 1) * limit).populate(populateQuery)
//             }
//             if (!removeLanguage) {
//                 requests = ClaimRequest.schema.methods.toJSONLocalizedOnly(requests, i18n.getLocale());
//             }
//             res.send(new ApiResponse(requests, page, pageCount, limit, count, req));
//         } catch (err) {
//             next(err);
//         }
//     },

//     async create(req, res, next) {
//         try {
//             let user = req.user;
//             const { redeemAmount = 0, donationAmount = 0 } = req.body;
//             let validatedBody = checkValidations(req);
//             if (!validatedBody.customer) {
//                 validatedBody.customer = user.id;
//             }
//             if (user.provider ) {
//                 validatedBody.provider = user.provider;  
//             }
                     
//             let claimRequest = await ClaimRequest.create(validatedBody);
//             claimRequest = ClaimRequest.schema.methods.toJSONLocalizedOnly(claimRequest, i18n.getLocale());
//             res.status(200).send(claimRequest);
//         } catch (err) {
//             next(err);
//         }
//     },

//     async update(req, res, next) {
//         try {
//             let { claimRequestId } = req.params;
//             let user = req.user;
//             let { removeLanguage } = req.query;

//             await checkExist(claimRequestId, ClaimRequest, { deleted: false });
//             let validatedBody = checkValidations(req);
//             let updatedrequest = await ClaimRequest.findByIdAndUpdate(claimRequestId, validatedBody, { new: true });
//             if (!removeLanguage)
//                 updatedrequest = ClaimRequest.schema.methods.toJSONLocalizedOnly(updatedrequest, i18n.getLocale());
//             res.status(200).send(updatedrequest);
//         } catch (err) {
//             next(err);
//         }
//     },

//     async cancel(req, res, next) {
//         try {
//             let { claimRequestId } = req.params;
//             let user = req.user;
//             let { removeLanguage } = req.query;

//             await checkExist(claimRequestId, ClaimRequest, { deleted: false });
//             let validatedBody = { status: 'CANCELED', cancelDate: new Date() };
//             let updatedrequest = await ClaimRequest.findByIdAndUpdate(claimRequestId, validatedBody, { new: true });
//             if (!removeLanguage)
//                 updatedrequest = ClaimRequest.schema.methods.toJSONLocalizedOnly(updatedrequest, i18n.getLocale());
//             res.status(200).send(updatedrequest);
//         } catch (err) {
//             next(err);
//         }
//     },

//     async accept(req, res, next) {
//         try {
//             let { claimRequestId } = req.params;
//             let user = req.user;
//             let { removeLanguage } = req.query;

          
//            let response = await checkExistThenGet(claimRequestId, ClaimRequest, { deleted: false});
//             let customer = await checkExistThenGet(response.customer, userModel, {deleted: false});
//             console.log(customer,'customer 222')
//             const country = await checkExistThenGet(customer.country, rewardPointsModel, {deleted: false});
//             console.log(country,'country')
//             console.log(response.redeemAmount, response.donationAmount,'redeemAmount, donationAmount')
//             let { redeemAmount = 0, donationAmount = 0 } = response;
//                    if (!country) {
//                        throw new ApiError(400, i18n.__("requestCountryMissing"));
//                                 }
                                
//                                 // 4️⃣ Update customer wallet/points (frontend-calculated)
//                                 let customerPoints ,customerWallet;
//                                 if(redeemAmount === 0){
//                                     customerPoints = (donationAmount || 0) * (country.point || 0);
//                                     customerWallet = donationAmount ;
//                                 }else{
//                                     customerPoints = (redeemAmount || 0) * (country.point || 0);
//                                     customerWallet = redeemAmount 
//                                 }
//                                 await User.findByIdAndUpdate(customer.id, {
//                                 $set: {
//                                     points: (customer.points - customerPoints),
//                                     wallet: (customer.wallet - customerWallet),
//                                     pointsSubtracted: (customer.pointsSubtracted || 0) + (customerPoints || 0),
//                                     walletSubtracted: (customer.walletSubtracted || 0) + (customerWallet || 0),
//                                 },
//                                 });


//             let validatedBody = { status: 'ACCEPTED', changeStatusDate: new Date() };
//             let updatedrequest = await ClaimRequest.findByIdAndUpdate(claimRequestId, validatedBody, { new: true });
//             if (!removeLanguage)
//                 updatedrequest = ClaimRequest.schema.methods.toJSONLocalizedOnly(updatedrequest, i18n.getLocale());
//             res.status(200).send(updatedrequest);
//         } catch (err) {
//             next(err);
//         }
//     },

//     async reject(req, res, next) {
//         try {
//             let { claimRequestId } = req.params;
//             let user = req.user;
//             let { removeLanguage } = req.query;

//             await checkExist(claimRequestId, ClaimRequest, { deleted: false, status: 'PENDING' });
//             let validatedBody = { status: 'REJECTED', changeStatusDate: new Date() };
//             let updatedrequest = await ClaimRequest.findByIdAndUpdate(claimRequestId, validatedBody, { new: true });
//             if (!removeLanguage)
//                 updatedrequest = ClaimRequest.schema.methods.toJSONLocalizedOnly(updatedrequest, i18n.getLocale());
//             res.status(200).send(updatedrequest);
//         } catch (err) {
//             next(err);
//         }
//     },

//     async findById(req, res, next) {
//         try {
//             let { claimRequestId } = req.params;
//             let { removeLanguage } = req.query;
//             let claimRequest = await checkExistThenGet(claimRequestId, ClaimRequest, { deleted: false, populate: populateQuery });
//             if (!removeLanguage) {
//                 claimRequest = ClaimRequest.schema.methods.toJSONLocalizedOnly(claimRequest, i18n.getLocale());
//             }
//             res.status(200).send(claimRequest);
//         } catch (err) {
//             next(err);
//         }
//     },

//     async delete(req, res, next) {
//         try {
//             let user = req.user;
//             let { claimRequestId } = req.params;
//             let claimRequest = await checkExistThenGet(claimRequestId, ClaimRequest, { deleted: false });
//             claimRequest.deleted = true;
//             await claimRequest.save();
//             res.status(200).send("Deleted Successfully");
//         }
//         catch (err) {
//             next(err);
//         }
//     },

//     async claimCount(req, res, next) {
//         try {
//             let { provider } = req.query;
//             let query = { deleted: false, status: { $in: ['PENDING'] } };
//             if (provider) {
//                 query.provider = provider;
//             }
//             // let count = await ClaimRequest.count(query);
//             let count = await ClaimRequest.countDocuments(query);
//             res.send({ count });
//         } catch (err) {
//             next(err);
//         }
//     },

//     async availableStatus(req, res, next) {
//         try {
//             let result = [
//                 {id:'PENDING',name:{ar:"تم الطلب",en:"Pending",es:"Pendiente"}},
//                 {id:'ACCEPTED',name:{ar:"في الطريق",en:"Accepted",es:"Aceptada"}},
//                 // {id:'REJECTED',name:{ar:"تم الرفض",en:"Rejected",es:"Rechazada"}},
//                 // {id:'CANCELED',name:{ar:"ملغاة",en:"Canceled",es:"Cancelada"}}
//             ]
            
//             // {
//             //     'PENDING':{ar:"تم الطلب",en:"Requested",es:"Solicitada"}, 
//             //     'ACCEPTED':{ar:"في الطريق",en:"Approved",es:"Aprobada"},
//             //     'REJECTED':{ar:"تم الرفض",en:"Rejected",es:"Rechazada"},
//             //     'CANCELED':{ar:"ملغاة",en:"Canceled",es:"Cancelada"}
//             // }
//             res.status(200).send({result});
//         } catch (err) {
//             next(err);
//         }
//     },

//     ////////////////////////////////



//     validateDeleteMulti() {
//         return [
//             body('ids').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
//                 .isArray().withMessage(() => { return i18n.__('invalidType') })
//         ];
//     },


//     async deleteMuti(req, res, next) {
//         try {
//             let user = req.user;
//             if (!['ADMIN', 'SUB_ADMIN'].includes(user.type))
//                 return next(new ApiError(403, i18n.__('unauthrized')));

//             let validatedBody = checkValidations(req);
//             let count = await ClaimRequest.count({ deleted: false, _id: { $in: validatedBody.ids } });

//             if (count != validatedBody.ids.length) {
//                 return next(new ApiError(403, i18n.__('invalidData')));
//             }
//             await ClaimRequest.updateMany({ _id: { $in: validatedBody.ids }, deleted: false }, { deletedBy: user.id, deleted: true, deletedDate: new Date() })
//             res.status(200).send("Deleted Successfully");
//         }
//         catch (err) {
//             next(err);
//         }
//     }
// }

import ClaimRequest from "../../models/claim-request.model/claim-request.model.js";
import User from "../../models/user.model/user.model.js";
import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist, checkDateFilter } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import rewardPointsModel from "../../models/reward-points.model/reward-points.model.js";

let populateQuery = [
    { path: 'provider', model: 'user' },
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
];

export default {
    validateBody(isUpdate = false) {
        let validations = [];
        if (!isUpdate) {
            validations = [
                body('redeemAmount').not().isEmpty().withMessage(() => i18n.__('filedRequired')),
                body('donationAmount').not().isEmpty().withMessage(() => i18n.__('filedRequired')),
                body('customer').optional().not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                    .custom(async (value) => {
                        await checkExistThenGet(value, User, { deleted: false });
                        return true;
                    })
            ];
        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { removeLanguage, all, provider, customer, status, hasNoProvider, hasProvider,
                bussinessName, customerName, search } = req.query;
            let query = { deleted: false };
            let sortQuery = { createdAt: -1 };
            checkDateFilter(req, query, sortQuery,true,true);

            if (hasNoProvider) query.provider = null;
            if (hasProvider) query.provider = { $ne: null };
            if (provider) query.provider = provider;

            if (bussinessName) {
                let ids = await User.find({ deleted: false, type: "CLIENT", bussinessName: { '$regex': bussinessName, '$options': 'i' } }).distinct('_id');
                query.customer = { $in: ids };
            }
            if (customerName) {
                let ids = await User.find({ deleted: false, type: "CLIENT", name: { '$regex': customerName, '$options': 'i' } }).distinct('_id');
                query.customer = { $in: ids };
            }
            if (search) {
                let ids = await User.find({
                    deleted: false, type: "CLIENT",
                    $or: [{ name: { '$regex': search, '$options': 'i' } }, { bussinessName: { '$regex': search, '$options': 'i' } }]
                }).distinct('_id');
                query.customer = { $in: ids };
            }
            if (customer) query.customer = customer;
            if (status) query.status = status;

            let count = await ClaimRequest.countDocuments(query);
            let requests;
            if (all) {
                limit = count;
                requests = await ClaimRequest.find(query).sort(sortQuery).populate(populateQuery);
            } else {
                requests = await ClaimRequest.find(query).sort(sortQuery).limit(limit).skip((page - 1) * limit).populate(populateQuery);
            }

            if (!removeLanguage) {
                requests = ClaimRequest.schema.methods.toJSONLocalizedOnly(requests, i18n.getLocale());
            }

            res.send(new ApiResponse(requests, page, Math.ceil(count / limit), limit, count, req));
        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            const { redeemAmount = 0, donationAmount = 0, customer: customerId } = req.body;

            let validatedBody = checkValidations(req);
            if (!validatedBody.customer) validatedBody.customer = user.id;

            let customer = await checkExistThenGet(validatedBody.customer, User, { deleted: false });
            const country = await rewardPointsModel.findOne({
                           country: customer.country,
                           deleted: false,
                           }).lean();
            console.log(country,'reward')

            let pointsToDeduct = 0, walletToDeduct = 0;

            if (redeemAmount === 0) {
                pointsToDeduct = donationAmount * (country.point || 0);
                walletToDeduct = donationAmount;
            } else {
                pointsToDeduct = redeemAmount * (country.point || 0);
                walletToDeduct = redeemAmount;
            }

            console.log(pointsToDeduct,'points to deduct')

            // Validate available points/wallet
            if (pointsToDeduct > (customer.points - (customer.pendingPoints || 0)) ||
                walletToDeduct > (customer.wallet - (customer.pendingWallet || 0))) {
                throw new ApiError(400, i18n.__("insufficientPointsWallet"));
            }

            // Update user's pending points/wallet
            customer.pendingPoints = (customer.pendingPoints || 0) + pointsToDeduct;
            customer.pendingWallet = (customer.pendingWallet || 0) + walletToDeduct;
            
            await customer.save();

            // validatedBody.pendingPoints = pointsToDeduct;
            // validatedBody.pendingWallet = walletToDeduct;

            if (user.provider) validatedBody.provider = user.provider;

            let claimRequest = await ClaimRequest.create(validatedBody);
            claimRequest = ClaimRequest.schema.methods.toJSONLocalizedOnly(claimRequest, i18n.getLocale());
            res.status(200).send(claimRequest);

        } catch (err) {
            next(err);
        }
    },

    async accept(req, res, next) {
        try {
            let { claimRequestId } = req.params;
            let { removeLanguage } = req.query;

            let request = await checkExistThenGet(claimRequestId, ClaimRequest, { deleted: false });
            let customer = await checkExistThenGet(request.customer, User, { deleted: false });
            const country = await rewardPointsModel.findOne({country: customer.country,deleted: false}).lean();
            
            console.log(country,'country')    

            // Reduce pending points/wallet since request is approved
            let pointsToDeduct = 0
            if (request.redeemAmount === 0) {
                pointsToDeduct = request.donationAmount * (country.point || 0);
            } else {
                pointsToDeduct = request.redeemAmount * (country.point || 0);
            }         
            // customer.pendingWallet = (customer.pendingWallet || 0) - ((request.redeemAmount === 0 ? request.donationAmount : request.redeemAmount)  || 0);
            // customer.pendingPoints = (customer.pendingPoints || 0) - (pointsToDeduct|| 0);

            // customer.points -= ((request.redeemAmount === 0 ? request.donationAmount : request.redeemAmount)  || 0)
            // customer.wallet -= pointsToDeduct || 0;

            // No change to actual points/wallet because it was already reserved on creation
            // request.pendingPoints = 0;
            // request.pendingWallet = 0;

            // await customer.save();


             await User.findByIdAndUpdate(customer._id, {
                            $set: {
                            points: customer.points,
                            wallet: customer.wallet,
                            // pointsAdded: (customer.pointsAdded || 0) + gainedPoints,
                            // walletAdded: (customer.walletAdded || 0) + pointsToMoney,
                            },
                        });

            let validatedBody = { status: 'ACCEPTED', changeStatusDate: new Date() };
            let updatedRequest = await ClaimRequest.findByIdAndUpdate(claimRequestId, validatedBody, { new: true });
            if (!removeLanguage) updatedRequest = ClaimRequest.schema.methods.toJSONLocalizedOnly(updatedRequest, i18n.getLocale());

            res.status(200).send(updatedRequest);

        } catch (err) {
            next(err);
        }
    },

    async reject(req, res, next) {
        try {
            let { claimRequestId } = req.params;
            let { removeLanguage } = req.query;

            let request = await checkExistThenGet(claimRequestId, ClaimRequest, { deleted: false, status: 'PENDING' });
            let customer = await checkExistThenGet(request.customer, User, { deleted: false });
            const country = await rewardPointsModel.findOne({country: customer.country,deleted: false}).lean();

            console.log(request,'request')    
            // Refund points/wallet

            let pointsToDeduct = 0
            if (request.redeemAmount === 0) {
                pointsToDeduct = request.donationAmount * (country.point || 0);
            } else {
                pointsToDeduct = request.redeemAmount * (country.point || 0);
            }         
            customer.pendingWallet = (customer.pendingWallet || 0) - ((request.redeemAmount === 0 ? request.donationAmount : request.redeemAmount)  || 0);
            customer.pendingPoints = (customer.pendingPoints || 0) - (pointsToDeduct|| 0);


            // customer.points += ((request.redeemAmount === 0 ? request.donationAmount : request.redeemAmount)  || 0)
            // customer.wallet += pointsToDeduct || 0;

         

            await customer.save();

            let validatedBody = { status: 'REJECTED', changeStatusDate: new Date() };
            let updatedRequest = await ClaimRequest.findByIdAndUpdate(claimRequestId, validatedBody, { new: true });
            if (!removeLanguage) updatedRequest = ClaimRequest.schema.methods.toJSONLocalizedOnly(updatedRequest, i18n.getLocale());

            res.status(200).send(updatedRequest);

        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { claimRequestId } = req.params;
            let { removeLanguage } = req.query;

            await checkExist(claimRequestId, ClaimRequest, { deleted: false });
            let validatedBody = checkValidations(req);
            let updatedRequest = await ClaimRequest.findByIdAndUpdate(claimRequestId, validatedBody, { new: true });
            if (!removeLanguage) updatedRequest = ClaimRequest.schema.methods.toJSONLocalizedOnly(updatedRequest, i18n.getLocale());

            res.status(200).send(updatedRequest);
        } catch (err) {
            next(err);
        }
    },

    async cancel(req, res, next) {
        try {
            let { claimRequestId } = req.params;
            let { removeLanguage } = req.query;

            await checkExist(claimRequestId, ClaimRequest, { deleted: false });
            let validatedBody = { status: 'CANCELED', cancelDate: new Date() };
            let updatedRequest = await ClaimRequest.findByIdAndUpdate(claimRequestId, validatedBody, { new: true });
            if (!removeLanguage) updatedRequest = ClaimRequest.schema.methods.toJSONLocalizedOnly(updatedRequest, i18n.getLocale());

            res.status(200).send(updatedRequest);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { claimRequestId } = req.params;
            let { removeLanguage } = req.query;
            let claimRequest = await checkExistThenGet(claimRequestId, ClaimRequest, { deleted: false, populate: populateQuery });
            if (!removeLanguage) claimRequest = ClaimRequest.schema.methods.toJSONLocalizedOnly(claimRequest, i18n.getLocale());
            res.status(200).send(claimRequest);
        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let { claimRequestId } = req.params;
            let claimRequest = await checkExistThenGet(claimRequestId, ClaimRequest, { deleted: false });
            claimRequest.deleted = true;
            await claimRequest.save();
            res.status(200).send("Deleted Successfully");
        } catch (err) {
            next(err);
        }
    },

    async claimCount(req, res, next) {
        try {
            let { provider } = req.query;
            let query = { deleted: false, status: { $in: ['PENDING'] } };
            if (provider) query.provider = provider;
            let count = await ClaimRequest.countDocuments(query);
            res.send({ count });
        } catch (err) {
            next(err);
        }
    },

    async availableStatus(req, res, next) {
        try {
            let result = [
                { id: 'PENDING', name: { ar: "تم الطلب", en: "Pending", es: "Pendiente" } },
                { id: 'ACCEPTED', name: { ar: "في الطريق", en: "Accepted", es: "Aceptada" } },
            ];
            res.status(200).send({ result });
        } catch (err) {
            next(err);
        }
    },

    validateDeleteMulti() {
        return [
            body('ids').not().isEmpty().withMessage(() => i18n.__('filedRequired'))
                .isArray().withMessage(() => i18n.__('invalidType'))
        ];
    },

    async deleteMuti(req, res, next) {
        try {
            let user = req.user;
            if (!['ADMIN', 'SUB_ADMIN'].includes(user.type))
                return next(new ApiError(403, i18n.__('unauthrized')));

            let validatedBody = checkValidations(req);
            let count = await ClaimRequest.count({ deleted: false, _id: { $in: validatedBody.ids } });

            if (count != validatedBody.ids.length) {
                return next(new ApiError(403, i18n.__('invalidData')));
            }
            await ClaimRequest.updateMany({ _id: { $in: validatedBody.ids }, deleted: false }, { deletedBy: user.id, deleted: true, deletedDate: new Date() });
            res.status(200).send("Deleted Successfully");
        } catch (err) {
            next(err);
        }
    }
};
