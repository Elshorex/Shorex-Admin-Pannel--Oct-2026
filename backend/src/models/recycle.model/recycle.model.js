import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const recycleSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      i18n: true,
    },
    description: {
      type: String,
      i18n: true,
    },
    image: {
      type: String,
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

// 🧹 Clean JSON output
recycleSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment for recycle IDs
recycleSchema.plugin(AutoIncrement, {
  id: "recycle_seq",
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n plugin
recycleSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("recycle", recycleSchema);
