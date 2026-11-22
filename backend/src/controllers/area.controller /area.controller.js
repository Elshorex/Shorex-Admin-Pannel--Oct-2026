import Area from "../../models/area.model/area.model.js";
import Country from "../../models/country.model/country.model.js";
import Region from "../../models/region.model/region.model.js";
import City from "../../models/city.model/city.model.js";
import Status from "../../models/status.model/status.model.js";

import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import {
  checkExistThenGet,
  checkExist,
  checkDateFilter,
} from "../../helpers/CheckMethods.js";
import { body } from "express-validator";
import {
  checkValidations,
  handleImg,
} from "../shared.controller/shared.controller.js";
import i18n from "i18n";
import dotObject from "dot-object";

let populateQuery = [
  { path: "status", model: "status" },
  { path: "country", model: "country" },
  { path: "region", model: "region" },
  { path: "city", model: "city" },
];

export default {

  validateBody(isUpdate = false) {
    let validations;
    if (!isUpdate) {
      validations = [
        body("latitude")
          .optional()
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          }),
        body("longitude")
          .optional()
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          }),
        body("name.ar")
          .trim()
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          })
          .custom(async (val, { req }) => {
            let query = {
              "name.ar": val,
              deleted: false,
              country: req.body.country,
              region: req.body.region,
              city: req.body.city,
            };
            let area = await Area.findOne(query).lean();
            if (area) throw new Error(i18n.__("duplicated"));
            return true;
          }),
        body("name.en")
          .trim()
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          })
          .custom(async (val, { req }) => {
            let query = {
              "name.en": val,
              deleted: false,
              country: req.body.country,
              region: req.body.region,
              city: req.body.city,
            };
            let area = await Area.findOne(query).lean();
            if (area) throw new Error(i18n.__("duplicated"));
            return true;
          }),
        body("name.es")
          .trim()
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          })
          .custom(async (val, { req }) => {
            let query = {
              "name.es": val,
              deleted: false,
              country: req.body.country,
              region: req.body.region,
              city: req.body.city,
            };
            let area = await Area.findOne(query).lean();
            if (area) throw new Error(i18n.__("duplicated"));
            return true;
          }),
        body("country")
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          })
          .custom(async (val) => {
            await checkExist(val, Country, { deleted: false });
            return true;
          }),
        body("region")
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          })
          .custom(async (val) => {
            await checkExist(val, Region, {  });
            return true;
          }),
        body("city")
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          })
          .custom(async (val) => {
            await checkExist(val, City, { deleted: false });
            return true;
          }),
        body("status")
          .optional()
          .isInt({ min: 0, max: 1 })
          .withMessage(() => {
            return i18n.__("invalidValue");
          }),
      ];
    } else {
      validations = [
        body("latitude")
          .optional()
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          }),
        body("longitude")
          .optional()
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          }),
        body("name.ar")
          .optional()
          .trim()
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          })
          .custom(async (val, { req }) => {
            let query = {
              "name.ar": val,
              deleted: false,
              _id: { $ne: req.params.areaId },
            };
            let area = await Area.findOne(query).lean();
            if (area) throw new Error(i18n.__("duplicated"));
            return true;
          }),
        body("name.en")
          .optional()
          .trim()
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          })
          .custom(async (val, { req }) => {
            let query = {
              "name.en": val,
              deleted: false,
              _id: { $ne: req.params.areaId },
            };
            let area = await Area.findOne(query).lean();
            if (area) throw new Error(i18n.__("duplicated"));
            return true;
          }),
        body("name.es")
          .optional()
          .trim()
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          })
          .custom(async (val, { req }) => {
            let query = {
              "name.es": val,
              deleted: false,
              _id: { $ne: req.params.areaId },
            };
            let area = await Area.findOne(query).lean();
            if (area) throw new Error(i18n.__("duplicated"));
            return true;
          }),
        body("country")
          .optional()
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          })
          .custom(async (val) => {
            await checkExist(val, Country, { deleted: false });
            return true;
          }),
        body("region")
          .optional()
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          })
          .custom(async (val) => {
            await checkExist(val, Region, { deleted: false });
            return true;
          }),
        body("city")
          .optional()
          .not()
          .isEmpty()
          .withMessage(() => {
            return i18n.__("filedRequired");
          })
          .custom(async (val) => {
            await checkExist(val, City, { deleted: false });
            return true;
          }),
        body("status")
          .optional()
          .isInt({ min: 0, max: 1 })
          .withMessage(() => {
            return i18n.__("invalidValue");
          }),
      ];
    }
    return validations;
  },

    async findAll(req, res, next) {
    try {
        let page = +req.query.page || 1,
            limit = +req.query.limit || 20;
        let { name, country, region, city, month, year, all, removeLanguage } = req.query;
        let query = {};
        let sortQuery = { _id: -1 };

        checkDateFilter(req, query);

        if (country) query.country = country;

        if (region) {
            let regions = Array.isArray(region)
                ? region.map(Number)
                : region.split(',').map(r => Number(r.trim()));
            query.region = { $in: regions };
        }

        if (city) {
            let cities = Array.isArray(city)
                ? city.map(Number)
                : city.split(',').map(c => Number(c.trim()));
            query.city = { $in: cities };
        }

        let count = await Area.countDocuments(query);
        let pageCount = count;
        let areas;

        if (all) {
            pageCount = 1;
            limit = count;
            areas = await Area.find(query).sort(sortQuery).populate(populateQuery);
        } else {
            pageCount = Math.ceil(count / limit);
            areas = await Area.find(query)
                .sort(sortQuery)
                .limit(limit)
                .skip((page - 1) * limit)
                .populate(populateQuery);
        }

        if (!removeLanguage) {
            areas = Area.schema.methods.toJSONLocalizedOnly(areas, i18n.getLocale());
        }

        res.send(new ApiResponse(areas, page, pageCount, limit, count, req));
    } catch (err) {
        next(err);
    }
},

  async create(req, res, next) {
    try {
      let user = req.user;
      if (user.type != "ADMIN" && user.type != "SUB_ADMIN") {
        return next(new ApiError(403, i18n.__("admin.auth")));
      }
      let validatedBody = checkValidations(req);
      let area = await Area.create(validatedBody);
      area = await Area.populate(area, populateQuery);
      area = Area.schema.methods.toJSONLocalizedOnly(area, i18n.getLocale());
      res.status(200).send(area);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      let { areaId } = req.params;
      let { removeLanguage } = req.query;
      let user = req.user;
      if (user.type != "ADMIN" && user.type != "SUB_ADMIN") {
        return next(new ApiError(403, i18n.__("admin.auth")));
      }
      await checkExist(areaId, Area, { deleted: false });
      let validatedBody = checkValidations(req);
      validatedBody = dotObject.dot(validatedBody);
      let updatedArea = await Area.findByIdAndUpdate(areaId, validatedBody, {
        new: true,
      });
      if (!removeLanguage)
        updatedArea = Area.schema.methods.toJSONLocalizedOnly(
          updatedArea,
          i18n.getLocale()
        );
      res.status(200).send(updatedArea);
    } catch (err) {
      next(err);
    }
  },

  async findById(req, res, next) {
    try {
      let { areaId } = req.params;
      let { removeLanguage } = req.query;
      let area = await checkExistThenGet(areaId, Area, {
        deleted: false,
        populate: populateQuery,
      });
      if (!removeLanguage) {
        area = Area.schema.methods.toJSONLocalizedOnly(area, i18n.getLocale());
      }
      res.status(200).send(area);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      let user = req.user;
      if (user.type != "ADMIN" && user.type != "SUB_ADMIN") {
        return next(new ApiError(403, i18n.__("admin.auth")));
      }
      let { areaId } = req.params;
      let area = await checkExistThenGet(areaId, Area, { deleted: false });
      area.deleted = true;
      await area.save();
      res.status(200).send("Deleted Successfully");
    } catch (err) {
      next(err);
    }
  },
};
