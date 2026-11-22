
import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const charitySchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      i18n: true,
    },
    lat: { type: Number },
    long: { type: Number },
    address: { type: String },
    icon: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

charitySchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🌍 i18n plugin
charitySchema.plugin(mongooseI18n, { locales: ["en", "ar"] });

// 🔢 Auto-increment with mongoose-sequence
charitySchema.plugin(AutoIncrement, {
  id: "charity_seq", // unique sequence for charity collection
  inc_field: "_id",
  start_seq: 1,
});

export default mongoose.model("charity", charitySchema);
