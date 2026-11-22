import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const sliderSchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    title: {
      type: String,
      i18n: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: Number,
    },
    product: {
      type: Number,
    },
    // institution: {
    //   type: Number,
    // },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🧹 Clean JSON output
sliderSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment (_id as Number)
sliderSchema.plugin(AutoIncrement, {
  id: "slider_seq", // unique counter name
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n support
sliderSchema.plugin(mongooseI18n, { locales: ["en", "ar"] });

export default mongoose.model("slider", sliderSchema);
