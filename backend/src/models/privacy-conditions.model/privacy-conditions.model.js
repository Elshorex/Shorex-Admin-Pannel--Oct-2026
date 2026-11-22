import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const privacySchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    description: {
      type: String,
      i18n: true,
    },
    type: {
      type: String,
      enum: ["PRIVACY_POLICY", "TERMS_CONDITION"],
    },
    country: {
      type: Number,
    },
    status: {
      type: Number,
      default: 1, // 1-active, 0-inactive
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🔄 Transform JSON output
privacySchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment _id (separate sequence for privacy)
privacySchema.plugin(AutoIncrement, {
  id: "privacy_seq",
  inc_field: "_id",
  start_seq: 1,
});

// 🌐 i18n support
privacySchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("privacy", privacySchema);
