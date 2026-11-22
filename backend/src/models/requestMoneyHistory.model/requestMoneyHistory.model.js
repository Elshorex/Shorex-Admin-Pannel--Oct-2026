import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18nLocalize from "mongoose-i18n-localize";

const AutoIncrement = AutoIncrementFactory(mongoose);

const requestMoneyHistorySchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    driver: {
      type: Number,
    },
    trader: {
      type: Number,
    },
    orders: {
      type: [Number],
      required: true,
    },
    payedDate: {
      type: Date,
    },
    payedBy: {
      type: Number,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🧹 JSON transformer
requestMoneyHistorySchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment
requestMoneyHistorySchema.plugin(AutoIncrement, {
  id: "requestMoneyHistory_seq", // unique counter name
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 Localization support
requestMoneyHistorySchema.plugin(mongooseI18nLocalize, { locales: ["en", "ar"] });

export default mongoose.model("requestMoneyHistory", requestMoneyHistorySchema);
