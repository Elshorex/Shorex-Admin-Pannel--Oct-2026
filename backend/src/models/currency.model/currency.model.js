import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const currencySchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    // code: {
    //   type: String
    // },
    name: {
      type: String,
      i18n: true,
    },
    symbol: {
      type: String,
    },
    precision: {
      type: Number,
    },
    // activated: {
    //   type: Boolean,
    //   default: true
    // },
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

// ✅ JSON Transformation
currencySchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment with unique counter
currencySchema.plugin(AutoIncrement, {
  id: "currency_seq", // unique counter ID
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n plugin
currencySchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("currency", currencySchema);
