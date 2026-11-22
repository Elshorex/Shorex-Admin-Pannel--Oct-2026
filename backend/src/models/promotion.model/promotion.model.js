import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const promotionSchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    promotionFromDate: {
      type: Date,
    },
    promotionToDate: {
      type: Date,
    },
    media: {
      type: String,
    },
    mediaType: {
      type: String,
      enum: ["IMAGE", "VIDEO"],
    },
    country: {
      type: Number,
      required: true,
      ref: "country",
    },
    status: {
      type: Number,
      default: 1,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🧹 Clean JSON output
promotionSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment for promotion IDs
promotionSchema.plugin(AutoIncrement, {
  id: "promotion_seq",
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n localization
promotionSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("promotion", promotionSchema);
