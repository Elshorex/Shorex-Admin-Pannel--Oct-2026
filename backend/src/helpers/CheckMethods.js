import ApiError from './ApiError.js';
import moment from 'moment'
import i18n from 'i18n'
import Favorites from '../models/favorites.model/favorites.model.js';


// const capitalizeFirstChar = (name) => name.charAt(0).toUpperCase() + name.slice(1);

export function checkDateFilter(req, query, sortQuery = {},ignoreNameFilter = false, utc = false) {
    try {
        let { month, year, sortKey, sortValue, fromDate, toDate, name ,status,id,
            filterDateKey, fromDateValue ,toDateValue  
        } = req.query;
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
        }

        if (fromDate && toDate) {
            let startOfDate , endOfDate;
            if(utc === true){
                fromDate = moment.utc(fromDate).toDate();
                toDate = moment.utc(toDate).toDate();
            }else{
                 startOfDate = moment(fromDate).startOf('day');
                 endOfDate = moment(toDate).endOf('day');
            }
            
            query.createdAt = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) };
        } else if (toDate && !fromDate) {
            let endOfDate = moment(toDate).endOf('day');
            query.createdAt = { $lte: new Date(endOfDate) };
        } else if (fromDate && !toDate) {
            let startOfDate = moment(fromDate).startOf('day');
            query.createdAt = { $gte: new Date(startOfDate) };
        }


        if (fromDateValue && toDateValue) {
            let startOfDate = moment.utc(fromDateValue).startOf('day');
            let endOfDate = moment.utc(toDateValue).endOf('day');
            query[filterDateKey] = { $gte: new Date(startOfDate), $lte: new Date(endOfDate) };
        } else if (toDateValue && !fromDateValue) {
            let endOfDate = moment(toDateValue).endOf('day');
            query[filterDateKey] = { $lte: new Date(endOfDate) };
        } else if (fromDateValue && !toDateValue) {
            let startOfDate = moment(fromDateValue).startOf('day');
            query[filterDateKey] = { $gte: new Date(startOfDate) };
        }

        if (name && (!ignoreNameFilter)) {

            query.$or = [
                { 'name.en': { '$regex': name, '$options': 'i' } },
                { 'name.ar': { '$regex': name, '$options': 'i' } },
                { 'name.es': { '$regex': name, '$options': 'i' } }
            ];
        }
        if (status) {
            query.status = status;
        }
        if (id) {
            query._id = id;
        }

        if (sortKey && sortValue) {
            // sortQuery = {};



            sortQuery[sortKey] = Number(sortValue || 1);

            for (const key in sortQuery) {
                if (key != sortKey) {
                    delete sortQuery[key];
                }

            }
            console.log(sortQuery);
        }

    } catch (error) {
        console.log(error);
        throw new ApiError(400, 'Can Not Set Language.');
    }
}

export function checkOwnership() {
    return (req, res, next) => {
        try {
            let {allData,hasProvider} = req.query;
            if (req.user) {
                if (['PROVIDER'].includes(req.user.type) ) {
                    req.query.provider = req.user.id;
                } else if (req.user.provider) {
                    req.query.provider = req.user.provider;
                }else if((!allData) && (!hasProvider)){
                    req.query.hasNoProvider = true
                }
            }
            next();
        } catch (err) {
            next(new ApiError(400, { message: `Failed To Parse ` }));
        }
    }
}

export function checkDeleteAuth() {
    return (req, res, next) => {
        try {
            if (req.user) {
                console.log('req.user.type ',req.user.type);
                
                if ( ['SUB_ADMIN','PROVIDER'].includes(req.user.type)) {
                    next(new ApiError(403, i18n.__('admin.auth')));
                }
            }
            next();
        } catch (err) {
            next(new ApiError(400, { message: `Failed To Parse ` }));
        }
    }
}


export const checkExist = async (id, Model, extraQuery = {}, errorMessage = '') => {
    if (typeof extraQuery != 'object') {
        errorMessage = extraQuery;
        extraQuery = {};
    }
    if (validId(id)) {
        let model = await Model.findOne({ _id: id, ...extraQuery }).lean();
        if (model)
            return;
    }
    throw new ApiError(404, errorMessage || i18n.__('notFound') /*`${Model.modelName} Not Found`*/);
};

export const checkFavorites = async (list, userId, queryItem, idField) => {
    try {
        let promises = [];
        for (let index = 0; index < list.length; index++) {
            let query = { deleted: false, user: userId }
            query[queryItem] = list[index][idField || 'id'];
            promises.push(Favorites.findOne(query));
        }
        let finalResult = await Promise.all(promises);
        for (let index = 0; index < finalResult.length; index++) {
            if (finalResult[index]) {
                list[index].favorite = true;
            } else {
                list[index].favorite = false;
            }
        }
        return list;
    } catch (error) {
        throw error;
    }

}

export function checkLanguage(arModel, enModel, req) {
    let language = i18n.getLocale(req);
    try {
        if (language == 'ar') {
            return arModel;
        }
        else {
            return enModel;
        }
    } catch (error) {
        throw new ApiError(400, 'Can Not Set Language.');
    }
}

export const checkExistThenGet = async (id, Model, findQuery = { populate: '', select: '' }, errorMessage = '') => {
    let populateQuery = findQuery.populate || '', selectQuery = findQuery.select || '';

    if (typeof findQuery != 'object') {
        errorMessage = findQuery;
        findQuery = {};
    } else {
        delete findQuery.populate;
        delete findQuery.select;
    }

    if (validId(id)) {
        let model = await Model.findOne({ _id: id, ...findQuery })
            .populate(populateQuery).select(selectQuery);
        if (model)
            return model;
    }

    throw new ApiError(404, errorMessage || i18n.__('notFound') /*`${Model.modelName} Not Found`*/);
};

export const createPromise = (query) => {
    let newPromise = new Promise(async (resolve, reject) => {
        try {
            const result = await query;
            resolve(result);
        } catch (error) {
            reject(error);
        }
    })
    return newPromise;
}


// export async function checkExistThenUpdate(id, Model, updateQuery, updateOptions = { populate: '', select: '' }, errorMessage = '') {
//     let populateQuery = updateQuery.populate, selectQuery = updateQuery.select;

//     delete updateQuery.populate;
//     delete updateQuery.select;

//     if (validId(id)) {
//         let model = await Model.findByIdAndUpdate(id, updateQuery, { new: true })
//             .populate(populateQuery).select(selectQuery);
//         if (model)
//             return model;
//     }

//     throw new ApiError(404, errorMessage || `${Model.modelName} Not Found`);
// }



export const validId = id => isNumeric(id);
export const validIds = ids => isArray(ids) && ids.every(id => validId(id));
export const isNumeric = value => Number.isInteger(parseInt(value));
export const isArray = values => Array.isArray(values);
export const isImgUrl = value => /\.(jpeg|jpg|png|PNG|JPG|JPEG)$/.test(value);
export const isLat = value => /^\(?[+-]?(90(\.0+)?|[1-8]?\d(\.\d+)?)$/.test(value);
export const isLng = value => /^\s?[+-]?(180(\.0+)?|1[0-7]\d(\.\d+)?|\d{1,2}(\.\d+)?)\)?$/.test(value);
export const isYear = value => /^\d{4}$/.test(value);
export const isInternationNo = value => /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value);