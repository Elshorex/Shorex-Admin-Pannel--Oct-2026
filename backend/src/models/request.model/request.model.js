import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const requestSchema = new Schema(
  {
    _id: { type: Number },
    requestId: { type: String },

    // 🔹 Auto-assigned warehouse (based on area → city → region → country)
    warehouse: { type: Number, ref: "warehouse" },

    // 🔹 StoreKeeper (copied from warehouse at the time of assignment)
    storeKeeper: { type: Number, ref: "user" }, // ✅ added

    // 🔹 Product requested for recycling
    product: { type: Number, ref: "product" },

    provider: { type: Number, ref: "user" },
    customer: { type: Number, ref: "user" },
    driver: { type: Number, ref: "user" },
    vehicle: { type: Number, ref: "vehicle" },

    productPoints: { type: Number, default: 0 },
    gainedReward: { type: Number, default: 0 },
    rewardSum: { type: String, default: "" },
    quantity: { type: Number, default: 0 },
    quality: { type: Number, default: 0 },
    cashAmount: { type: Number, default: 0 },
    gainedPoints: { type: Number, default: 0 },
    originalQuantity: { type: Number, default: 0 },

    // 🔹 Reward options
    rewardType: [
      {
        type: String,
        enum: ["CASH", "PRODUCTS", "POINTS"], // uppercase consistency
      },
    ],
    rewardedProducts: [
      {
        product: { type: Number, ref: "rewardedProduct" },
        quantity: { type: Number, default: 1 },
      },
    ],

    // 🔹 Pickup info
    pickupDate: { type: Date },
    location: { type: String },

    // 🔹 Hierarchy for assignment
    country: { type: Number, ref: "country" },
    region: { type: Number, ref: "region" },
    city: { type: Number, ref: "city" },
    areas: [{ type: Number, ref: "area" }],

    // 🔹 Notes
    note: { type: String },
    notes: { type: String, default:"" },
    driverNote: { type: String },

    // 🔹 Dates
    onTheWayDate: Date,
    deliveryDate: Date,
    completedDate: Date,
    failDate: Date,
    cancelDate: Date,

    status: {
      type: String,
      enum: ["PENDING", "ON_THE_WAY", "DELIVERED", "FAILED", "CANCELED", "COMPLETED"],
      default: "PENDING",
    },

    createdBy: { type: Number, ref: "user" }, // ✅ added ref
    createdByType: {
      type: String,
      enum: ["CUSTOMER", "DRIVER", "ROUTE"],
      default: "CUSTOMER",
    },

    deleted: { type: Boolean, default: false },
    deletedDate: { type: Date },
    deletedBy: { type: Number, ref: "user" },
  },
  { timestamps: true }
);

// 🧹 JSON cleanup
requestSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment `_id`
requestSchema.plugin(AutoIncrement, {
  id: "request_seq",
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n support
requestSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("request", requestSchema);
