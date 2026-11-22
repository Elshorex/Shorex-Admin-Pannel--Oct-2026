import User from "../../models/user.model/user.model.js";
import Category from "../../models/category.model/category.model.js";
import Complain from "../../models/complaint.model/complaint.model.js";
import Order from "../../models/order.model/order.model.js";
import moment from "moment";
import i18n from 'i18n';
import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";



export default {

    async usersReport(req, res, next) {
        try {

            let page = +req.query.page || 1,
                limit = +req.query.limit || 20;
            var { name, type, fromDate, toDate, phone, email, activated,
                countryKey, countryCode, month, year, day, archive, country, category, status,
                institutionType, subCategory, sortByOrders, sortByRate
            } = req.query;
            let users, pageCount, userCount;
            let aggregateStages = [];
            var query = { deleted: false };

            if (!type) {
                return next(new ApiError(404, i18n.__('typeRequired')))
            }

            if (archive) query.deleted = true;
            if (status) query.status = status;
            if (name) query.name = { '$regex': name, '$options': 'i' };
            if (phone) query.phone = { '$regex': phone, '$options': 'i' };
            if (email) query.email = { '$regex': email, '$options': 'i' };

            if (activated) {
                query.activated = (activated == 'true') ? true : false;
            }
            if (institutionType) {
                query.institutionType = institutionType;
            }
            if (type) {
                query.type = type
            }
            if (countryKey) query.countryKey = countryKey;
            if (countryCode) query.countryCode = countryCode;
            if (country) {
                let userCountries = await Address.find({ deleted: false, country: country }).distinct('user');
                query._id = { $in: userCountries }
            }
            if (category) query.category = category;
            if (subCategory) {
                query.subCategory = subCategory;
            }

            if (fromDate && toDate) {
                let startOfDate = moment(fromDate).startOf('day');
                let endOfDate = moment(toDate).endOf('day');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) };
            } else if (toDate && !fromDate) {
                let endOfDate = moment(toDate).endOf('day');
                query.createdAt = { $lte: new Date(endOfDate) };
            } else if (fromDate && !toDate) {
                let startOfDate = moment(fromDate).startOf('day');
                query.createdAt = { $gte: new Date(startOfDate) };
            }

            let date = new Date();
            if (month && year && !day) {
                month = month - 1;
                date.setMonth(month);
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('month');
                let endOfDate = moment(date).endOf('month');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            else if (year && !month) {
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('year');
                let endOfDate = moment(date).endOf('year');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            else if (month && year && day) {
                month = month - 1;
                date.setMonth(month);
                date.setFullYear(year);
                date.setDate(day);
                let startOfDay = moment(date).startOf('day');
                let endOfDay = moment(date).endOf('day');
                query.createdAt = { $gte: new Date(startOfDay), $lte: new Date(endOfDay) }
            }


            if (type == 'INSTITUTION') {
                aggregateStages = [
                    { $match: query },
                    {
                        $lookup: {
                            from: 'orders',
                            let: { trader: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [{ $eq: ['$deleted', false] }, { $eq: ['$trader', '$$trader'] },
                                                //{ $in: ['$traders.status', ['DELIVERED', 'REJECTED', 'TRADER_CANCELED', 'CLIENT_CANCELED',]] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'orders'
                        }
                    },
                    { $set: { 'orders': { $size: "$orders" } } },
                    {
                        $lookup: {
                            from: 'orders',
                            let: { trader: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [{ $eq: ['$deleted', false] }, { $eq: ['$trader', '$$trader'] },
                                            { $eq: ['$status', 'DELIVERED'] }
                                                //{ $in: ['$traders.status', ['DELIVERED', 'REJECTED', 'TRADER_CANCELED', 'CLIENT_CANCELED',]] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'finished'
                        }
                    },
                    { $set: { 'finished': { $size: "$finished" } } },
                    {
                        $lookup: {
                            from: 'orders',
                            let: { trader: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [{ $eq: ['$deleted', false] }, { $eq: ['$trader', '$$trader'] },
                                            { $eq: ['$status', 'WAITING'] }
                                                //{ $in: ['$traders.status', ['DELIVERED', 'REJECTED', 'TRADER_CANCELED', 'CLIENT_CANCELED',]] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'waiting'
                        }
                    },
                    { $set: { 'waiting': { $size: "$waiting" } } }
                ]
            } else if (type == 'CLIENT') {
                aggregateStages = [
                    { $match: query },
                    {
                        $lookup: {
                            from: 'orders',
                            let: { user: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [{ $eq: ['$deleted', false] }, { $eq: ['$user', '$$user'] },
                                                //{ $in: ['$traders.status', ['DELIVERED', 'REJECTED', 'TRADER_CANCELED', 'CLIENT_CANCELED',]] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'orders'
                        }
                    },
                    { $set: { 'orders': { $size: "$orders" } } },
                    {
                        $lookup: {
                            from: 'orders',
                            let: { user: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [{ $eq: ['$deleted', false] }, { $eq: ['$user', '$$user'] },
                                            { $eq: ['$status', 'DELIVERED'] }
                                                //{ $in: ['$traders.status', ['DELIVERED', 'REJECTED', 'TRADER_CANCELED', 'CLIENT_CANCELED',]] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'finished'
                        }
                    },
                    { $set: { 'finished': { $size: "$finished" } } },
                    {
                        $lookup: {
                            from: 'orders',
                            let: { user: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [{ $eq: ['$deleted', false] }, { $eq: ['$user', '$$user'] },
                                            { $in: ['$status', ['REJECTED', 'CANCELED', 'ADMIN_CANCELED']] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'canceled'
                        }
                    },
                    { $set: { 'canceled': { $size: "$canceled" } } }

                ]
            } else if (type == 'DRIVER') {
                aggregateStages = [
                    { $match: query },
                    {
                        $lookup: {
                            from: 'orders',
                            let: { driver: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [{ $eq: ['$deleted', false] }, { $eq: ['$driver', '$$driver'] },
                                            { $in: ['$status', ['DELIVERED', 'REJECTED', 'CANCELED']] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'finishedOrdered'
                        }
                    },
                    { $set: { 'finishedOrdered': { $size: "$finishedOrdered" } } },
                    {
                        $lookup: {
                            from: 'orders',
                            let: { driver: '$_id' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [{ $eq: ['$deleted', false] }, { $eq: ['$driver', '$$driver'] },
                                            { $in: ['$status', ['WAITING', 'DRIVER_ACCEPTED', 'SHIPPED']] }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'currentOrders'
                        }
                    },
                    { $set: { 'currentOrders': { $size: "$currentOrders" } } },


                ]
            }

            aggregateStages.push({
                $facet: {
                    data: [

                        { $set: { rate: { $cond: [{ $eq: ['$totalRateCount', 0] }, 0, { $divide: ['$totalRate', '$totalRateCount'] }] } } },
                        { $sort: sortByOrders ? { finishedOrders: +sortByOrders } : sortByRate ? { rate: +sortByRate } : { '_id': -1 } },
                        { $skip: ((page - 1) * limit) },
                        { $limit: limit }
                    ],
                    pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }]
                },
            })

            let data = await User.aggregate(aggregateStages)

            users = data[0].data;
            userCount = data[0].pageInfo.length > 0 ? data[0].pageInfo[0].count : 0;
            pageCount = Math.ceil(userCount / limit);
            res.send(new ApiResponse(users, page, pageCount, limit, userCount, req));


        } catch (error) {
            next(error);
        }
    },

    async categoryReport(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { name, month, year, type, institutionType, category } = req.query
            let query = { deleted: false, parent: { $eq: null }, type: null };
            if (name) {
                query.$or = [{ 'name.en': { '$regex': name, '$options': 'i' } }, { 'name.ar': { '$regex': name, '$options': 'i' } }]
            }
            if (type) query.type = type;
            if (institutionType) {
                query.institutionType = institutionType;
            }
            if (category) {
                query._id = +category;
            }
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
            let categoriesCount, categories, pageCount;

            let aggregateStages = [
                { $match: query },
                {
                    $lookup: {
                        from: 'users',
                        let: { category: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{ $eq: ['$deleted', false] }, { $in: ['$$category', '$category'] }]
                                    }
                                }
                            }
                        ],
                        as: 'users'
                    }
                },

                {
                    $facet: {
                        data: [
                            { $sort: { '_id': -1 } },
                            { $skip: ((page - 1) * limit) },
                            { $limit: limit }
                        ],
                        pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }]
                    }
                }]
            let data = await Category.aggregate(aggregateStages);
            categories = data[0].data;
            categoriesCount = data[0].pageInfo.length > 0 ? data[0].pageInfo[0].count : 0;
            pageCount = Math.ceil(categoriesCount / limit);
            res.send(new ApiResponse(categories, page, pageCount, limit, categoriesCount, req));
        } catch (err) {
            next(err);
        }
    },

    async complainReport(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { name, month, year, createdAt, userType, user, userName, title } = req.query
            let query = { deleted: false };

            if (userType) query.userType = userType;
            if (user) query.user = +user;
            if (title) {
                query.$or = [{ 'title.en': { '$regex': title, '$options': 'i' } }, { 'title.ar': { '$regex': title, '$options': 'i' } }]
            }

            let date = new Date();
            if (month && year) {
                month = month - 1;
                date.setMonth(month);
                date.setFullYear(year);
                let startOfDate = new Date(moment(date).startOf('month'));
                let endOfDate = new Date(moment(date).endOf('month'));

                query.createdAt = { $gte: startOfDate, $lte: endOfDate }
            }
            else if (year && !month) {
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('year');
                let endOfDate = moment(date).endOf('year');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            } else if (createdAt) {
                let startOfDate = new Date(moment(createdAt).startOf('day'));
                let endOfDate = new Date(moment(createdAt).endOf('day'));
                
                query.createdAt = { $gte: startOfDate, $lte: endOfDate }
            }

            let complainsCount, complains, pageCount;

            let aggregateStages = [
                { $match: query },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]

            if (userName || name) {
                aggregateStages.push({
                    $match: { 'user.name': { '$regex': userName || name, '$options': 'i' } }
                });
            }

            aggregateStages.push({
                $facet: {
                    data: [
                        { $sort: { '_id': -1 } },
                        { $skip: ((page - 1) * limit) },
                        { $limit: limit }
                    ],
                    pageInfo: [{ $group: { _id: null, count: { $sum: 1 } } }]
                }
            })

            let promissData = await Promise.all([
                Complain.aggregate(aggregateStages),
                Complain.count({ deleted: false, closed: true }),
                // Complain.count({deleted:false,closed:false})
            ])
            let data = promissData[0];

            complains = data[0].data;
            complainsCount = data[0].pageInfo.length > 0 ? data[0].pageInfo[0].count : 0;
            pageCount = Math.ceil(complainsCount / limit);
            let closedComplains = promissData[1];
            let openedComplains = complainsCount - closedComplains;
            res.send(new ApiResponse(complains, page, pageCount, limit, complainsCount, req, { openedComplains, closedComplains }));
        } catch (err) {
            next(err);
        }
    },

    async mostUsedComplainReason(req, res, next) {
        try {
            let { month, year, createdAt, userType, user } = req.query
            let query = { deleted: false };

            if (userType) query.userType = userType;
            if (user) query.user = +user;

            let date = new Date();
            if (month && year) {
                month = month - 1;
                date.setMonth(month);
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('month');
                let endOfDate = moment(date).endOf('month');

                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            else if (year && !month) {
                date.setFullYear(year);
                let startOfDate = moment(date).startOf('year');
                let endOfDate = moment(date).endOf('year');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            } else if (createdAt) {
                let startOfDate = moment(date).startOf('day');
                let endOfDate = moment(date).endOf('day');
                query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) }
            }
            let data = await Complain.aggregate().match(query)
                .group({ _id: '$title', count: { $sum: 1 } }).sort({ count: -1 }).limit(5);
            res.status(200).send({ data });
        } catch (error) {
            next(error);
        }
    },

    async driverReport(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { driver, fromDate, toDate, name } = req.query;
            let query = { deleted: false, type: 'DRIVER' };
            let orderQuery = [
                { $eq: ['$$id', '$driver'] },
                // { $eq: ['$paymentMethod', 'CASH'] },
                { $eq: ['$status', 'DELIVERED'] },
                { $eq: ['$deleted', false] }
            ]

            if (name) query.name = { '$regex': name, '$options': 'i' };
            if (driver) query._id = +driver;

            
            if (fromDate && toDate) {
                let startOfDate = new Date(moment(fromDate).startOf('day'));
                let endOfDate = new Date(moment(toDate).endOf('day'));
               
                orderQuery.push({$and:[{$gte:['$createdAt',startOfDate]},{$lte:['$createdAt',endOfDate]}]})
            } else if (toDate && !fromDate) {
                let endOfDate = new Date(moment(toDate).endOf('day'));
                orderQuery.push({$lte:['$createdAt',endOfDate]})
            } else if (fromDate && !toDate) {
                let startOfDate = new Date(moment(fromDate).startOf('day'));
                orderQuery.push({$gte:['$createdAt',startOfDate]})
            }

            let data = await User.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: 'orders',
                        let: { driver: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{ $eq: ['$deleted', false] }, { $eq: ['$driver', '$$driver'] },
                                            //{ $in: ['$traders.status', ['DELIVERED', 'REJECTED', 'TRADER_CANCELED', 'CLIENT_CANCELED',]] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'orders'
                    }
                },
                { $set: { 'orders': { $size: "$orders" } } },
                {
                    $lookup: {
                        from: 'orders',
                        let: { driver: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{ $eq: ['$deleted', false] }, { $eq: ['$driver', '$$driver'] },
                                        { $eq: ['$status', 'DELIVERED'] }
                                            //{ $in: ['$traders.status', ['DELIVERED', 'REJECTED', 'TRADER_CANCELED', 'CLIENT_CANCELED',]] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'finished'
                    }
                },
                { $set: { 'finished': { $size: "$finished" } } },
                {
                    $lookup: {
                        from: 'orders',
                        let: { driver: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{ $eq: ['$deleted', false] }, { $eq: ['$driver', '$$driver'] },
                                        { $in: ['$status', ['DRIVER_ACCEPTED','PREPARED', 'SHIPPED']] }
                                            //{ $in: ['$traders.status', ['DELIVERED', 'REJECTED', 'TRADER_CANCELED', 'CLIENT_CANCELED',]] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'current'
                    }
                },
                { $set: { 'current': { $size: "$current" } } },
                {
                    $facet: {
                        data: [
                            // { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, orders: { $push: '$$ROOT' }, count: { $sum: 1 } } },
                            { $sort: { '_id': -1 } },
                            { $skip: ((page - 1) * limit) },
                            { $limit: limit }
                        ],
                        pageInfo: [{ $match: query }]
                    }
                }
            ]);
            let users = data[0].data;
            let usersCount = data[0].pageInfo.length;
            let pageCount = Math.ceil(usersCount / limit);
            res.send(new ApiResponse(users, page, pageCount, limit, usersCount, req));
        } catch (error) {
            next(error)
        }
    }
}

