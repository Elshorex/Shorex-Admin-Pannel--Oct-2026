import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const pointSchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    country: {
      type: Number,
    },
    point: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    createdBy: {
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

// 🧹 JSON transformer
pointSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment
pointSchema.plugin(AutoIncrement, {
  id: "point_seq", // unique counter name for this collection
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 Localization support
pointSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("point", pointSchema);
