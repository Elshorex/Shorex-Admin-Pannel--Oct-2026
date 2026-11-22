import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";

const AutoIncrement = AutoIncrementFactory(mongoose);

const rateSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    user: {
      type: Number,
      required: true,
      ref: "user",
    },
    product: {
      type: Number,
      required: true,
      ref: "product",
    },
    order: {
      type: Number,
    },
    rate: {
      type: Number,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🧹 Clean JSON output
rateSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment for rate IDs
rateSchema.plugin(AutoIncrement, {
  id: "rate_seq",
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n
rateSchema.plugin(mongooseI18n, { locales: ["ar", "en"] });

export default mongoose.model("rate", rateSchema);
