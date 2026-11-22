import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const CitySchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
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
    status: {
      type: Number,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

CitySchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🌍 localization
CitySchema.plugin(mongooseI18n, { locales: config.locals });

// 🔢 auto-increment with mongoose-sequence
CitySchema.plugin(AutoIncrement, {
  id: "city_seq", // unique counter for this collection
  inc_field: "_id",
  start_seq: 1,
});

export default mongoose.model("city", CitySchema);
