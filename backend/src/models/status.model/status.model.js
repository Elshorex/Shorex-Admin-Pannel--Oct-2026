import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const statusSchema = new Schema(
  {
    _id: {
      // 1 - active, 2 - not-active, 3 - blocked
      type: Number,
      // required: true,
    },
    name: {
      type: String,
      i18n: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🧹 Clean JSON output
statusSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment (_id as Number)
statusSchema.plugin(AutoIncrement, {
  id: "status_seq", // unique counter name
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n localization
statusSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("status", statusSchema);
