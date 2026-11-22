import ClaimRewards from "../../models/claim-request.model/claim-request.model.js";
import Request from "../../models/request.model/request.model.js";
import User from "../../models/user.model/user.model.js";
import { createPromise } from '../../helpers/CheckMethods.js'
import moment from "moment";
import requestController from "../request.controller/request.controller.js";

let months = {
    1:'January',
    2:'February',
    3:'March',
    4:'April',
    5:'May',
    6:'June',
    7:'July',
    8:'August',
    9:'September',
    10:'October',
    11:'November',
    12:'December'
}

let getDateQuery = (dateDuration,query,key) => {
    try {
        // let start = new Date();
        if ( [1,3,6,12].includes(dateDuration) ) {
            // start = new Date(start.setMonth(start.getMonth() - dateDuration));

            let durationMonths = dateDuration;
            let today = new Date();
            let endDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            let startDate = new Date(endDate);
            startDate.setMonth(endDate.getMonth() - durationMonths + 1);
            endDate = new Date( moment(endDate).endOf('month') );
            query[key] = {$gte:startDate , $lte:endDate};
        }
        console.log('queryquery =>> ',query);
        return query;
    } catch (error) {
        throw error;
    }
}

let getMonthsResult = (data=[])=>{
    try {
        return data.map(i=> `${months[i._id.month]}-${i._id.year}` );
    } catch (error) {
        throw error;
    }
}


let formatGraphIndexes = (mongoResult, duration) => {
    try {
        if (duration) {
            // Duration in months, excluding the current month
            const durationMonths = duration; // Example: last 6 months, not including the current month

            // Calculate the endDate (last day of the month before the current month)
            const today = new Date();
            const endDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

            // Calculate the startDate by subtracting the duration from the endDate
            const startDate = new Date(endDate);
            startDate.setMonth(endDate.getMonth() - durationMonths + 1);

            console.log('startDate ==> ', startDate, endDate);

            // Generate the full range of year-months with count 0, based on the duration
            const fullRange = [];
            let current = new Date(startDate);

            while (current <= endDate) {
                fullRange.push({
                    _id: {
                        year: current.getFullYear(),
                        month: current.getMonth() + 1
                    },
                    count: 0
                });
                current.setMonth(current.getMonth() + 1);
            }

            // Map MongoDB results to the same format
            const mongoData = mongoResult.map(item => ({
                _id: item._id,
                count: item.count
            }));

            // Merge the full range with MongoDB data, replacing counts where data exists
            const finalResult = fullRange.map(item => {
                const match = mongoData.find(data =>
                    data._id.year === item._id.year && data._id.month === item._id.month
                );
                return match ? match : item;
            });

            console.log(finalResult);
            return finalResult
        }
        return mongoResult;

    } catch (error) {
        console.log('error ', error);
        return mongoResult
    }
}

export default {

    async count(req, res, next) {
        try {
            let {duration} = req.query;
            duration = +duration;
            let query = {deleted:false};
            getDateQuery(duration,query,'createdAt');


            const availableRewards = Request.aggregate().match(query)
                .group({ _id: null, availableRewards:{ $sum: '$gainedPoints'} });

            const donationAmount = ClaimRewards.aggregate().match(query)
                .group({ _id: null, donationAmount:{ $sum: '$donationAmount'} });


            // const clients = createPromise(User.count({ deleted: false, type: 'CLIENT' }));
            // const branches = createPromise(User.count({ deleted: false, type: 'INSTITUTION' ,headBranch:null}));
            
            let counts = [
                availableRewards,
                donationAmount
            ]
            let result = await Promise.all(counts);

            res.status(200).send({
                availableRewards: result[0].length ? result[0][0].availableRewards:0,
                donationAmount: result[1].length ? result[1][0].donationAmount : 0  
            });
        } catch (err) {
            next(err);
        }
    },


    async claimRewardGraph(req, res, next) {
        try {
            let {duration} = req.query;
            duration = +duration;
            // let date = new Date();
            // let lastMonth = date.getMonth() - 6 ;
            // let lastMonthDate = new Date(new Date().setMonth(lastMonth));
            let query = { deleted: false /*, createdAt:{$gte:lastMonthDate}*/ };
            getDateQuery(duration,query,'createdAt');

            let aggregateQuery = [
                { $match: query },
                { 
                    $group: { 
                        // _id: { $dateToString: { format: "%Y-%m-%d", date: "$acceptedDate" } }, 
                        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                        count: { $sum: 1 } 
                    } 
                }
            ];
            let ClaimRewardsGraph = await ClaimRewards.aggregate(aggregateQuery);
            ClaimRewardsGraph = formatGraphIndexes(ClaimRewardsGraph,duration);
            let total = ClaimRewardsGraph.reduce((accumulator, currentValue)=>accumulator + currentValue.count,0)
            
            let x_AxisArray = getMonthsResult(ClaimRewardsGraph);
            let y_AxisArray = ClaimRewardsGraph.map(i=>i.count);
            
            res.status(200).send({total,x_AxisArray,y_AxisArray, ClaimRewardsGraph: ClaimRewardsGraph });
        } catch (err) {
            next(err);
        }
    },


    async requestStatusGraph(req, res, next) {
        try {
            let {duration} = req.query;
            duration = +duration;
            // let date = new Date();
            // let lastMonth = date.getMonth() - 6 ;
            // let lastMonthDate = new Date(new Date().setMonth(lastMonth));
            let query = { deleted: false/*, createdAt:{$gte:lastMonthDate}*/ };

            getDateQuery(duration,query,'createdAt');

            let inprogress=true , future = true , history= true , failed = true;
            {
                // let startOfDate = new Date();
                // let endOfDate = new Date( new Date().setDate(new Date().getDate()+2) ); 
                // let pickupDate = { $gte: new Date( moment(startOfDate).startOf('day') ), $lte: new Date( moment(endOfDate).endOf('day') ) };
                let inprogressQuery = {};
                requestController.getInprogressQuery(inprogressQuery);
                inprogress = Request.countDocuments({...query,...inprogressQuery});
            } 
            {
                // let startOfDate = new Date( new Date().setDate(new Date().getDate()+2) );
                // let pickupDate = { $gt: new Date(startOfDate) };
                let futureQuery = {};
                requestController.getFutureQuery(futureQuery);
                future = Request.countDocuments({...query,...futureQuery});
            } 
            {
                let historyQuery = {};
                requestController.getFutureQuery(historyQuery);
                history = Request.countDocuments({...query,...historyQuery});
            } 
            {
                let failedQuery = {};
                requestController.getFailedQuery(failedQuery);
                failed = Request.countDocuments({...query,...failedQuery});
            }
            let result = await Promise.all([inprogress,future,history,failed]);
            let total = result.reduce((accumulator, currentValue)=>accumulator + currentValue,0)
            res.status(200).send({total, requestStatusGraph: {inprogress:result[0],future:result[1],history:result[2],failed:result[3]} });
        } catch (err) {
            next(err);
        }
    },


    async customerGraph(req, res, next) {
        try {
            let {duration} = req.query;
            duration = +duration;

            // let date = new Date();
            // let lastMonth = date.getMonth() - 6 ;
            // let lastMonthDate = new Date(new Date().setMonth(lastMonth));
            let query = { deleted: false,type: "CLIENT", /*createdAt:{$gte:lastMonthDate}*/ };
            getDateQuery(duration,query,'createdAt');

            let aggregateQuery = [
                { $match: query },
                { 
                    $group: { 
                        // _id: { $dateToString: { format: "%Y-%m-%d", date: "$acceptedDate" } }, 
                        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                        count: { $sum: 1 } 
                    } 
                }
            ];
            let userGraph = await User.aggregate(aggregateQuery);
            let total = userGraph.reduce((accumulator, currentValue)=>accumulator + currentValue.count,0)
            userGraph = formatGraphIndexes(userGraph,duration);
            let x_AxisArray = getMonthsResult(userGraph);
            let y_AxisArray = userGraph.map(i=>i.count);
            res.status(200).send({total,x_AxisArray,y_AxisArray, userGraph: userGraph });
        } catch (err) {
            next(err);
        }
    },


    async providerRequestsGraph(req, res, next) {
        try {
            let {duration} = req.query;
            duration = +duration;

            // let date = new Date();
            // let lastMonth = date.getMonth() - 6 ;
            // let lastMonthDate = new Date(new Date().setMonth(lastMonth));
            let query = { deleted: false, /*createdAt:{$gte:lastMonthDate}*/ };
            getDateQuery(duration,query,'createdAt');

            let aggregateQuery = [
                { $match: query },
                { 
                    $group: { 
                        _id: '$provider',
                        count: { $sum: 1 } 
                    } 
                },
                {
                    $lookup:
                      {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'provider'
                      }
                },
                {
                    $unwind: {
                        path: "$provider",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ];
            let providersGraph = await Request.aggregate(aggregateQuery);
            let total = providersGraph.reduce((accumulator, currentValue)=>accumulator + currentValue.count,0)
            res.status(200).send({total, providersGraph: providersGraph });
        } catch (err) {
            next(err);
        }
    }

}