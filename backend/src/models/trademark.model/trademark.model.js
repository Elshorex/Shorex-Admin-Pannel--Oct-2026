import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const trademarkSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      i18n: true,
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

trademarkSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment `_id` using mongoose-sequence
trademarkSchema.plugin(AutoIncrement, {
  id: "trademark_seq", // unique counter name
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n localization
trademarkSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("trademark", trademarkSchema);
