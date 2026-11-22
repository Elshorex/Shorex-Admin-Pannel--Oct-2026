import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";

const AutoIncrement = AutoIncrementFactory(mongoose);

const contactUsSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    notes: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      i18n: true,
    },
    phone: {
      type: String,
      required: true,
    },
    reply: [String],

    user: {
      type: Number,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ toJSON transformer
contactUsSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment plugin
contactUsSchema.plugin(AutoIncrement, {
  id: "contactUs_seq", // unique counter name for this collection
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 Localization plugin
contactUsSchema.plugin(mongooseI18n, { locales: ["ar", "en"] });

export default mongoose.model("contactUs", contactUsSchema);
