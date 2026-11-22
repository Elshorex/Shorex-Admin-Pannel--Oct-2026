import mongoose, { Schema } from "mongoose";
import mongooseI18nLocalize from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

// 📍 Embedded schema for location
const locationSchema = new Schema({
  long: { type: Number, required: true },
  lat: { type: Number, required: true },
  address: { type: String, required: true, default: "el-Giza" },
});

const CompanySchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
    },
    logo: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    androidUrl: {
      type: String,
    },
    iosUrl: {
      type: String,
    },
    socialLinks: {
      type: [{ key: { type: String }, value: { type: String } }],
    },
    aboutUs: {
      type: String,
      i18n: true,
    },
    location: {
      type: locationSchema,
    },
    phone: String,
    email: String,
    appVersion: {
      type: String,
      i18n: true,
    },
    numberPerPage: Number,
  },
  { timestamps: true }
);

// 🛠 Clean JSON output
CompanySchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🌍 Localization
CompanySchema.plugin(mongooseI18nLocalize, { locales: ["ar", "en"] });

// 🔢 Auto-increment (_id)
CompanySchema.plugin(AutoIncrement, {
  id: "company_seq", // unique counter for this model
  inc_field: "_id",
  start_seq: 1,
});

export default mongoose.model("company", CompanySchema);
