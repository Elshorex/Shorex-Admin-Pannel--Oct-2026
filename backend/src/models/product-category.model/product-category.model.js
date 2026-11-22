import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";

const AutoIncrement = AutoIncrementFactory(mongoose);

const productCategorySchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      i18n: true,
    },
    icon: {
      type: String,
    },
    user: {
      type: Number,
      ref: "user",
    },
    type: {
      type: String,
      enum: ["NORMAL", "CHARITY"],
      default: "NORMAL",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🔄 JSON transformation (standardized with your other models)
productCategorySchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment plugin (isolated counter for productCategory)
productCategorySchema.plugin(AutoIncrement, {
  id: "productCategory_seq",
  inc_field: "_id",
  start_seq: 1,
});

// 🌐 i18n support
productCategorySchema.plugin(mongooseI18n, { locales: ["en", "ar"] });

export default mongoose.model("productCategory", productCategorySchema);
