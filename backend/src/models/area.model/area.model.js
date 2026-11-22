import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const AreaSchema = new Schema(
  {
    _id: {
      type: Number,
    },
    name: {
      type: String,
      i18n: true,
    },
    country: {
      type: Number,
      required: true,
      ref: "country",
    },
    region: {
      type: Number,
      required: true,
      ref: "region",
    },
    city: {
      type: Number,
      required: true,
      ref: "city",
    },
    status: {
      type: Number,
      default: 1, // active by default
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🧹 Clean JSON output
AreaSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🌍 i18n plugin
AreaSchema.plugin(mongooseI18n, { locales: config.locals });

// 🔢 Auto-increment `_id`
AreaSchema.plugin(AutoIncrement, {
  id: "area_seq", // unique sequence name for area collection
  inc_field: "_id",
  start_seq: 1,
});

export default mongoose.model("area", AreaSchema);
