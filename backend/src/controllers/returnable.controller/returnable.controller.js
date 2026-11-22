import Returnable from "../../models/returnable.model/returnable.model.js";
import User from "../../models/user.model/user.model.js";
import Warehouse from "../../models/warehouse.model/warehouse.model.js";

import ApiResponse from "../../helpers/ApiResponse.js";
import ApiError from "../../helpers/ApiError.js";
import {
  checkExistThenGet,
  checkExist,
  checkDateFilter,
} from "../../helpers/CheckMethods.js";
import { body } from "express-validator";
import { checkValidations } from "../shared.controller/shared.controller.js";
import i18n from "i18n";
import dotObject from "dot-object";
import moment from "moment-timezone";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 🔹 Populations for find and details
let populateQuery = [
  { path: "customer", model: "user" },
  { path: "driver", model: "user" },
  { path: "warehouse", model: "warehouse" },
  { path: "provider", model: "user" },
];

export default {
  // ✅ VALIDATION
  validateBody(isUpdate = false) {
    let validations;
    if (!isUpdate) {
      validations = [
        // 🔹 Multilingual itemName validations
        body("itemName.ar")
          .not()
          .isEmpty()
          .withMessage(() => i18n.__("filedRequired"))
          .custom(async (val) => {
            let query = { "itemName.ar": val, deleted: false };
            let item = await Returnable.findOne(query).lean();
            if (item) throw new Error(i18n.__("duplicated"));
            return true;
          }),

        body("itemName.en")
          // .optional()
          .not()
          .isEmpty()
          .withMessage(() => i18n.__("filedRequired"))
          .custom(async (val) => {
            let query = { "itemName.en": val, deleted: false };
            let item = await Returnable.findOne(query).lean();
            if (item) throw new Error(i18n.__("duplicated"));
            return true;
          }),

        body("itemName.es")
          .not()
          .isEmpty()
          .withMessage(() => i18n.__("filedRequired"))
          .custom(async (val) => {
            let query = { "itemName.es": val, deleted: false };
            let item = await Returnable.findOne(query).lean();
            if (item) throw new Error(i18n.__("duplicated"));
            return true;
          }),


        body("quantity")
          .not()
          .isEmpty()
          .withMessage(() => i18n.__("filedRequired"))
          .isInt({ min: 1 })
          .withMessage(() => i18n.__("invalidValue")),

        body("value")
          .not()
          .isEmpty()
          .withMessage(() => i18n.__("filedRequired"))
          .isInt({ min: 1 })
          .withMessage(() => i18n.__("invalidValue")),

        body("customer")
          .not()
          .isEmpty()
          .withMessage(() => i18n.__("filedRequired"))
          .custom(async (val) => {
            await checkExist(val, User, { deleted: false });
            return true;
          }),
         body("notes")
          .not()
          .isEmpty()
          .withMessage(() => i18n.__("filedRequired")),
        body("belongsToCustomer")
          .optional()
          .isBoolean()
          .withMessage(() => i18n.__("invalidValue")),
        body("driver")
          .not()
          .isEmpty()
          .withMessage(() => i18n.__("filedRequired"))
          .custom(async (val) => {
            await checkExist(val, User, { deleted: false });
            return true;
          }),

        body("warehouse")
          .optional()
          .custom(async (val) => {
            await checkExist(val, Warehouse, { deleted: false });
            return true;
          }),

        body("status")
          .optional()
          .isIn([
            "DELIVERED_TO_CLIENT",
            "RECEIVED_BY_SHOREX",
            "CLEANING",
          ])
          .withMessage(() => i18n.__("invalidValue")),
      ];
    } else {
      validations = [
         // 🔹 Multilingual itemName validations
        body("itemName.ar")
          .optional(),
          // .not()
          // .isEmpty()
          // .withMessage(() => i18n.__("filedRequired")),
          // .custom(async (val) => {
          //   let query = { "itemName.ar": val, deleted: false };
          //   let item = await Returnable.findOne(query).lean();
          //   if (item) throw new Error(i18n.__("duplicated"));
          //   return true;
          // }),
        body("belongsToCustomer")
          .optional()
          .isBoolean()
          .withMessage(() => i18n.__("invalidValue")),
        body("itemName.en")
          .optional(),
          // .not()
          // .isEmpty()
          // .withMessage(() => i18n.__("filedRequired")),
          // .custom(async (val) => {
          //   let query = { "itemName.en": val, deleted: false };
          //   let item = await Returnable.findOne(query).lean();
          //   if (item) throw new Error(i18n.__("duplicated"));
          //   return true;
          // }),

        body("itemName.es")
          .optional(),
          // .not()
          // .isEmpty()
          // .withMessage(() => i18n.__("filedRequired")),
          // .custom(async (val) => {
          //   let query = { "itemName.es": val, deleted: false };
          //   let item = await Returnable.findOne(query).lean();
          //   if (item) throw new Error(i18n.__("duplicated"));
          //   return true;
          // }),

        body("notes")
           .optional()
          .not()
          .isEmpty()
          .withMessage(() => i18n.__("filedRequired")),
        body("customer")
          .not()
          .isEmpty()
          .withMessage(() => i18n.__("filedRequired"))
          .custom(async (val) => {
            await checkExist(val, User, { deleted: false });
            return true;
          }),

        body("quantity")
          .optional()
          .isInt({ min: 1 })
          .withMessage(() => i18n.__("invalidValue")),

        body("value")
          .optional()
          .isInt({ min: 1 })
          .withMessage(() => i18n.__("invalidValue")),

        body("status")
          .optional()
          .isIn([
            "DELIVERED_TO_CLIENT",
            "RECEIVED_BY_SHOREX",
            "CLEANING",
          ])
          .withMessage(() => i18n.__("invalidValue")),
      ];
    }

    return validations;
  },

  // ✅ FIND ALL
      async findAll(req, res, next) {
        try {
          let page = +req.query.page || 1,
            limit = +req.query.limit || 20;
          let {
            all,
            removeLanguage,
            status,
            driver,
            customer,
            warehouse,
            provider,
            search,
            tz,
          } = req.query;

          let query = { deleted: false };
          let sortQuery = { createdAt: -1 };

          // ✅ Apply date filter if provided
          checkDateFilter(req, query);

          // ✅ Base filters
          if (status) query.status = status;
          if (warehouse) query.warehouse = warehouse;
          if (provider) query.provider = provider;

          // ✅ Role-based access filtering
          let user = req.user;
          if (user.type === "CUSTOMER") {
            query.customer = user._id;
          } else if (user.type === "DRIVER") {
            query.driver = user._id;

            // ✅ Timezone-safe date override for drivers (Client TZ → UTC DB)
            let { fromDate, toDate } = req.query;
            const timezone = tz || "UTC";

            if (fromDate && toDate) {
              let startOfDate = moment.tz(fromDate, timezone).startOf("day").utc().toDate();
              let endOfDate = moment.tz(toDate, timezone).endOf("day").utc().toDate();
              query.createdAt = { $gte: startOfDate, $lte: endOfDate };
            } else if (fromDate && !toDate) {
              // Single day only
              let startOfDate = moment.tz(fromDate, timezone).startOf("day").utc().toDate();
              let endOfDate = moment.tz(fromDate, timezone).endOf("day").utc().toDate();
              query.createdAt = { $gte: startOfDate, $lte: endOfDate };
            } else if (toDate && !fromDate) {
              let endOfDate = moment.tz(toDate, timezone).endOf("day").utc().toDate();
              query.createdAt = { $lte: endOfDate };
            }

            let normalizedSearch = search?.trim();
            let normalizedCustomer = customer?.trim();
            let customerFilterValue = normalizedCustomer || normalizedSearch;

            if (customerFilterValue) {
              let exactNameRegex = new RegExp(
                `^${escapeRegex(customerFilterValue)}$`,
                "i"
              );
              let numericCustomerId = Number(customerFilterValue);
              let customerQuery = {
                deleted: false,
                type: "CLIENT",
                $or: [{ name: exactNameRegex }],
              };

              if (!Number.isNaN(numericCustomerId)) {
                customerQuery.$or.push({ _id: numericCustomerId });
              }

              let matchedCustomers = await User.find(customerQuery)
                .select("_id")
                .lean();

              query.customer = { $in: matchedCustomers.map((item) => item._id) };
            }
          } else {
            // Admins and Sub-admins can view all or filter manually
            if (driver) query.driver = driver;
            if (customer) query.customer = customer;
          }

          // ✅ Count documents for pagination
          let count = await Returnable.countDocuments(query);
          let pageCount = count;
          let items;

          // ✅ Fetch with or without pagination
          if (all) {
            pageCount = 1;
            limit = count;
            items = await Returnable.find(query)
              .sort(sortQuery)
              .populate(populateQuery);
          } else {
            pageCount = Math.ceil(count / limit);
            items = await Returnable.find(query)
              .sort(sortQuery)
              .limit(limit)
              .skip((page - 1) * limit)
              .populate(populateQuery);
          }

          // ✅ Localized response (if not disabled)
          if (!removeLanguage) {
            items = Returnable.schema.methods.toJSONLocalizedOnly(
              items,
              i18n.getLocale()
            );
          }

          // ✅ Return structured response
          res.send(new ApiResponse(items, page, pageCount, limit, count, req));
        } catch (err) {
          next(err);
        }
      },

  // ✅ CREATE
  async create(req, res, next) {
    try {
      let user = req.user;
      if (user.type != "ADMIN" && user.type != "DRIVER" && user.type != "SUB_ADMIN") {
        return next(new ApiError(403, i18n.__("admin.auth")));
      }

      let validatedBody = checkValidations(req);
      validatedBody.createdBy = user._id;

      let returnable = await Returnable.create(validatedBody);
      returnable = await Returnable.populate(returnable, populateQuery);
      returnable = Returnable.schema.methods.toJSONLocalizedOnly(
        returnable,
        i18n.getLocale()
      );

      res.status(200).send(returnable);
    } catch (err) {
      next(err);
    }
  },

  // ✅ UPDATE
  async update(req, res, next) {
    try {
      let { returnableId } = req.params;
      let user = req.user;

      // if (user.type != "ADMIN" && user.type != "SUB_ADMIN") {
      //   return next(new ApiError(403, i18n.__("admin.auth")));
      // }

      await checkExist(returnableId, Returnable, { deleted: false });
      let validatedBody = checkValidations(req);
      validatedBody.updatedBy = user._id;

      validatedBody = dotObject.dot(validatedBody);
      let updatedItem = await Returnable.findByIdAndUpdate(
        returnableId,
        validatedBody,
        { new: true }
      );

      updatedItem = await Returnable.populate(updatedItem, populateQuery);
      updatedItem = Returnable.schema.methods.toJSONLocalizedOnly(
        updatedItem,
        i18n.getLocale()
      );

      res.status(200).send(updatedItem);
    } catch (err) {
      next(err);
    }
  },

  // ✅ FIND BY ID
  async findById(req, res, next) {
    try {
      let { returnableId } = req.params;
      let { removeLanguage } = req.query;

      let item = await checkExistThenGet(returnableId, Returnable, {
        deleted: false,
        populate: populateQuery,
      });

      if (!removeLanguage) {
        item = Returnable.schema.methods.toJSONLocalizedOnly(
          item,
          i18n.getLocale()
        );
      }

      res.status(200).send(item);
    } catch (err) {
      next(err);
    }
  },

  // ✅ DELETE (Soft)
  async delete(req, res, next) {
    try {
      let user = req.user;
      if (user.type != "ADMIN" && user.type != "SUB_ADMIN") {
        return next(new ApiError(403, i18n.__("admin.auth")));
      }

      let { returnableId } = req.params;
      let item = await checkExistThenGet(returnableId, Returnable, {
        deleted: false,
      });
      item.deleted = true;
      await item.save();

      res.status(200).send("Deleted Successfully");
    } catch (err) {
      next(err);
    }
  },

  // ✅ CHANGE STATUS
  async changeStatus(req, res, next) {
    try {
      let { returnableId } = req.params;
      let { status } = req.body;
      let user = req.user;

      if (
        ![
          "DELIVERED_TO_CLIENT",
          "RECEIVED_BY_SHOREX",
          "CLEANING",
        ].includes(status)
      ) {
        return next(new ApiError(400, i18n.__("invalidValue")));
      }

      let item = await checkExistThenGet(returnableId, Returnable, {
        deleted: false,
      });
      item.status = status;
      item.updatedBy = user._id;
      await item.save();

      res.status(200).send("Status Updated Successfully");
    } catch (err) {
      next(err);
    }
  },
};
