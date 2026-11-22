import User from "../../models/user.model/user.model.js";
import Product from "../../models/product.model/product.model.js";
import Favorites from "../../models/favorites.model/favorites.model.js";
import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import { checkExistThenGet, checkExist } from "../../helpers/CheckMethods.js";
import { body } from 'express-validator';
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from 'i18n';

let populateQuery = [
    { path: 'trader', model: 'user'},
    {
        path: 'product', model: 'product',
        populate: [{ path: 'trader', model: 'user' }, { path: 'productCategory', model: 'productCategory' }]
    },
    { path: 'user', model: 'user' }
];


export default {


    validateBody() {
        let validations = [
            body('product').not().isEmpty().withMessage(() => { return i18n.__('productRequired') })
                .custom(async (value) => {
                    await checkExistThenGet(value, Product, { deleted: false })
                })
        ];
        return validations;
    },

    validateTrader() {
        let validations = [
            body('trader').not().isEmpty().withMessage(() => { return i18n.__('traderRequired') })
                .custom(async (value) => {
                    await checkExistThenGet(value, User, { deleted: false })
                })
        ];
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { user, product, admin,trader , all,tardersOnly,productsOnly } = req.query;
            let query = { deleted: false };
            if (user) query.user = +user;
            if (product) query.product = +product;
            if (trader) query.trader = +trader;
            if (tardersOnly) {
                query.trader = {$ne:null}
            }else if (productsOnly) {
                query.product = {$ne:null}
            }
            
            let favs = [];
            favs = await Favorites.find(query)
                    .limit(limit).skip((page - 1) * limit)
                    .sort({ createdAt: -1 }).populate(populateQuery);
            
            const favCount = await Favorites.count(query);
            const pageCount = Math.ceil(favCount / limit);
            res.send(new ApiResponse(favs, page, pageCount, limit, favCount, req));
        } catch (err) {
            next(err);
        }
    },

    async findAllForClient(req, res, next) {
        try {
           
            let query = { deleted: false };
             query.user = +req.user.id;
           
            
            let favs = [];
            favs = await Promise.all([
                Favorites.find({...query , trader:{$ne:null}}),
                Favorites.find({...query , product:{$ne:null}}),
            ])
                    
            
            
            res.send({traders:favs[0],products:favs[1]});
        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            let validatedBody = checkValidations(req);
            validatedBody.user = user.id;
            let oldFav = await Favorites.findOne({ ...validatedBody, deleted: false });
            if (oldFav) {
                return next(new ApiError(400, i18n.__('duplicated')));
            }
            let favorite = await Favorites.create(validatedBody);
            favorite = await Favorites.populate(favorite, populateQuery);
            res.status(200).send({ favorite: favorite });
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { favoriteId } = req.params;
            await checkExist(favoriteId, Favorites, { deleted: false });
            let validatedBody = checkValidations(req);
            let updatedfavorite = await Favorites.findByIdAndUpdate(favoriteId, validatedBody, { new: true });
            res.status(200).send({ favorite: updatedfavorite });
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { favoriteId } = req.params;
            let favorite = await checkExistThenGet(favoriteId, Favorites, { deleted: false, populate: populateQuery });
            res.status(200).send({ favorite: favorite });

        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let {trader,product} = req.body;
            if (!(trader||product)) {
                return next(new ApiError(404,i18n.__('targetRequired')));
            }
            let query = { deleted: false, user: req.user.id }

            if (trader) {
                query.trader = trader;
            }
            if (product) {
                query.product = product;
            }
            let favorite = await Favorites.findOne(query);
            if (!favorite) {
                return next(new ApiError(404, i18n.__('NotFound')));
            }
            favorite.deleted = true;
            await favorite.save();
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    }
}