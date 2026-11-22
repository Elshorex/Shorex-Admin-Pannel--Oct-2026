import Address from "../../models/address.model/address.model.js";
import City from "../../models/city.model/city.model.js";
import Region from "../../models/region.model/region.model.js";
import ApiResponse from "../../helpers/ApiResponse.js";
import { checkExistThenGet, checkExist } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';
import moment from 'moment'
import ApiError from "../../helpers/ApiError.js";
import promocodeController from "../promocode.controller/promocode.controller.js";

let populateQuery = [{path:'region',model:'region',
// populate:[{path:'country',model:'country'}]
},
{ path: 'user', model: 'user' }];


export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
              
                body('addressName').not().isEmpty().withMessage(() => { return i18n.__('addressNameRequired') }),
                body('region').not().isEmpty().withMessage(() => { return i18n.__('regionRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Region, { deleted: false });
                    return true;
                }),
                body('street').not().isEmpty().withMessage(() => { return i18n.__('streetRequired') }),
                body('buildingNumber').not().isEmpty().withMessage(() => { return i18n.__('buildingNumberRequired') }),
                body('flatNumber').not().isEmpty().withMessage(() => { return i18n.__('flatNumberRequired') }),
                body('long').not().isEmpty().withMessage(() => { return i18n.__('longRequired') }),
                body('lat').not().isEmpty().withMessage(() => { return i18n.__('latRequired') }),
                body('address').not().isEmpty().withMessage(() => { return i18n.__('addressRequired') }),
                
            ];
        }
        else {
            validations = [
                body('region').optional().not().isEmpty().withMessage(() => { return i18n.__('regionRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Region, { deleted: false });
                    return true;
                }),
                body('active').optional().not().isEmpty().withMessage(() => { return i18n.__('activeRequired') })
                .isBoolean().withMessage(() => { return i18n.__('invalidValue') }),
                body('long').optional().not().isEmpty().withMessage(() => { return i18n.__('longRequired') }),
                body('lat').optional().not().isEmpty().withMessage(() => { return i18n.__('latRequired') }),
                body('address').optional().not().isEmpty().withMessage(() => { return i18n.__('addressRequired') }),
                
                body('addressName').optional().not().isEmpty().withMessage(() => { return i18n.__('addressNameRequired') }),
                body('buildingNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('buildingNumberRequired') }),
                body('flatNumber').optional().not().isEmpty().withMessage(() => { return i18n.__('flatNumberRequired') }),
                
            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;

            let { city,region, month, year,user ,address} = req.query;
            let query = { deleted: false };

            if (address) query.address={ '$regex': address, '$options': 'i' }
            if (region) query.region={ '$regex': region, '$options': 'i' }
            if (city) query.city = city;
            if (user) query.user = user;

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

            let addresses = await Address.find(query).sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit).populate(populateQuery)
            const addressCount = await Address.count(query);
            let pageCount = Math.ceil(addressCount / limit);
            addresses = Address.schema.methods.toJSONLocalizedOnly(addresses, i18n.getLocale());

            res.send(new ApiResponse(addresses, page, pageCount, limit, addressCount, req));

        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            let validatedBody = checkValidations(req);
            validatedBody.user = user.id;
            if (validatedBody.long || validatedBody.lat ) {
                if (!(validatedBody.lat && validatedBody.long && validatedBody.address )) {
                    return next(new ApiError(404,i18n.__('locationValueError')));
                }
            }

            let addressCount = await Address.count({deleted:false,user:user.id});
            if (addressCount == 0) {
                validatedBody.active = true;
            }else{
                validatedBody.active = false;
            }

            let address = await Address.create(validatedBody);
            address = await Address.populate(address, populateQuery);
            address = Address.schema.methods.toJSONLocalizedOnly(address, i18n.getLocale());
            res.status(200).send(address);

            await promocodeController.newAddressPromocodes(user,address);

        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { addressId } = req.params;
            let user = req.user;
            await checkExist(addressId, Address, { deleted: false });
            let validatedBody = checkValidations(req);
            if (validatedBody.long || validatedBody.lat) {
                if (!(validatedBody.lat && validatedBody.long)) {
                    return next(new ApiError(404,i18n.__('locationValueError')));
                }
            }

            if (validatedBody.active) {
                await Address.updateMany({deleted:false,user:user.id , _id:{$ne:addressId}},{$set:{active:false}});
            }
            if (validatedBody.long && validatedBody.lat) {
                validatedBody.geoLocation = {
                    type:'Point' ,
                    coordinates:[validatedBody.long,validatedBody.lat]
                }
            }
            
            
            let updatedaddress = await Address.findByIdAndUpdate(addressId, validatedBody, { new: true }).populate(populateQuery);
            updatedaddress = Address.schema.methods.toJSONLocalizedOnly(updatedaddress, i18n.getLocale());
            res.status(200).send(updatedaddress);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { addressId } = req.params;
            let address = await checkExistThenGet(addressId, Address, { deleted: false, populate: populateQuery });

            address = Address.schema.methods.toJSONLocalizedOnly(address, i18n.getLocale());

            res.status(200).send(address);

        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let { addressId } = req.params;
            let user = req.user;
            let address = await checkExistThenGet(addressId, Address, { deleted: false });
            let addressCount = await Address.count({deleted:false,user:user.id});
            if (addressCount == 1) {
                return next(new ApiError(400,i18n.__('canNotDeleteLastAddress')));
            }
            address.deleted = true;
            await address.save();
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    }
}
