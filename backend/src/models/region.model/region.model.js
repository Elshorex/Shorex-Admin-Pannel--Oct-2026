
import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const RegionSchema = new Schema(
  {
    _id: {
      type: Number,
    },
    name: {
      type: String,
      i18n: true,
    },
    postalCode: {
      type: String, 
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
     country: {
      type: Number,
      required: true,
      ref: "country",
    },
    status: {
      type: Number,
    },
    deleted: {
     type: Number,
     default: false,
    },
  },
  { timestamps: true }
);

// 🧹 JSON cleanup
RegionSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment `_id`
RegionSchema.plugin(AutoIncrement, {
  id: "region_seq",
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n plugin
RegionSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("region", RegionSchema);
