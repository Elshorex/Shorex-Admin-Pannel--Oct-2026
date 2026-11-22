import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const ReturnableSchema = new Schema(
  {
    _id: {
      type: Number,
    },

    // 🧱 Item Information
    itemName: {
      type: String,
      required: true,
      i18n: true, 
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
     value: {
      type: Number,
      required: true,
      min: 1,
    },

    // 🧍‍♂️ Relations
    customer: {
      type: Number,
      ref: "user",
      required: true,
    },
    driver: {
      type: Number,
      ref: "user",
      required: true,
    },
    warehouse: {
      type: Number,
      ref: "warehouse",
    },
    provider: {
      type: Number,
      ref: "user",
    },
    belongsToCustomer : {
      type: Boolean,
      default: false,
    },

    // 🚦 Status Lifecycle
    status: {
      type: String,
      enum: [
        "DELIVERED_TO_CLIENT", // Driver delivered to client
        "RECEIVED_BY_SHOREX",  // Client Returned to Shorex
        "CLEANING",  // Customer requested cleaning
      ],
      default: "DELIVERED_TO_CLIENT",
    },

    // 📝 Meta Info
    notes: {
      type: String,
    },
    createdBy: {
      type: Number,
      ref: "user",
    },
    updatedBy: {
      type: Number,
      ref: "user",
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🧹 Clean JSON Output
ReturnableSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🌍 i18n Plugin for localized fields
ReturnableSchema.plugin(mongooseI18n, { locales: config.locals });

// 🔢 Auto-increment `_id` field
ReturnableSchema.plugin(AutoIncrement, {
  id: "returnable_seq",
  inc_field: "_id",
  start_seq: 1,
});

export default mongoose.model("returnable", ReturnableSchema);
