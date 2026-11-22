import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const CountrySchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    // code:{
    //     type:Number
    // },
    name: {
      type: String,
      i18n: true,
    },
    currency: {
      type: Number,
    },
    countryCode: {
      // telephone prefix '966'
      type: String,
    },
    defaultLanguage: {
      type: Number,
    },
    image: {
      type: String,
    },
    status: {
       type: Number, 
       default: 1
    },
    weekend: [Number],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ toJSON transformer
CountrySchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment plugin (unique counter for country)
CountrySchema.plugin(AutoIncrement, {
  id: "country_seq", // unique counter name
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 Localization plugin
CountrySchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("country", CountrySchema);
