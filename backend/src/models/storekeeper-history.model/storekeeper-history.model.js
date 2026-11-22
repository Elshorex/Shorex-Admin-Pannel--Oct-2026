import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const storeKeeperHistorySchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    startAt: Date,
    endAt: Date,
    warehouse: {
      type: Number,
    },
    name: {
      type: String,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

// 🧹 Clean JSON output
storeKeeperHistorySchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.password; // although password isn't in schema
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment for `_id`
storeKeeperHistorySchema.plugin(AutoIncrement, {
  id: "storeKeeperHistory_seq", // unique counter name
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n localization
storeKeeperHistorySchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("storeKeeperHistory", storeKeeperHistorySchema);
