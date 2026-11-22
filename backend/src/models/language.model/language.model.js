import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const languageSchema = new Schema(
  {
    _id: {
      type: Number,
    },
    name: {
      type: String,
      i18n: true,
    },
    direction: {
      type: String,
      enum: ["ltr", "rtl"],
    },
    key: {
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

// ✅ Clean JSON output
languageSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment for _id
languageSchema.plugin(AutoIncrement, {
  id: "language_seq",  // unique counter ID
  inc_field: "_id",
  start_seq: 1,
});

// 🌐 i18n plugin
languageSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("language", languageSchema);
