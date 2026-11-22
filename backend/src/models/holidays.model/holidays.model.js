

import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const holidaysSchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    type: {
      type: String,
      enum: ["PUBLIC", "MAINTENANCE"],
    },
    name: {
      type: String,
      i18n: true,
    },
    holidayName: {
      type: String,
    },
    country: {
      type: Number,
      ref: "country",
    },
    ranges: [
      {
        fromDate: Date,
        toDate: Date,
        duration: Number,
      },
    ],
    holidayYear: Number,
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Clean JSON output
holidaysSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment with unique counter
holidaysSchema.plugin(AutoIncrement, {
  id: "holidays_seq", // dedicated counter for holidays
  inc_field: "_id",
  start_seq: 1,
});

// 🌐 Add i18n support
holidaysSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("holidays", holidaysSchema);
