
import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const contactusSchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    email: {
      type: String,
    },
    whatsapp: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    telegram: {
      type: String,
    },
    location: {
      type: String,
    },
    country: {
      type: Number,
      ref: "country",
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

// ✅ Transform output
contactusSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment plugin
contactusSchema.plugin(AutoIncrement, {
  id: "contactus_seq", // unique sequence name
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 Localization
contactusSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("contactus", contactusSchema);
