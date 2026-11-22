import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const productSchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    productCategory: {
      type: Number,
      ref: "productCategory", // 🔄 fixed ref (was "category")
    },
    name: {
      type: String,
      i18n: true,
    },
    quantityQuestion: {
      type: String,
      i18n: true,
    },
    points: {
      type: Number,
      required: true,
    },
    country: {
      type: Number,
      required: true,
      ref: "country",
    },
    image: {
      type: String,
    },
    createdBy: {
      type: Number,
      ref: "user",
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🔄 Clean JSON output
productSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment for product IDs
productSchema.plugin(AutoIncrement, {
  id: "product_seq",
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n localization
productSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("product", productSchema);
