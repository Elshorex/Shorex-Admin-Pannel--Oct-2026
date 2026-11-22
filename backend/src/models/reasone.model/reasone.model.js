import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";

const AutoIncrement = AutoIncrementFactory(mongoose);

const reasoneSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["ALL", "CLIENT", "STORE", "DRIVER"],
      default: "ALL",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      i18n: true,
    },
    title: {
      type: String,
      i18n: true,
    },
    likedCount: {
      type: Number,
      default: 0,
    },
    disLikedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 🧹 Clean JSON output
reasoneSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment for reasone IDs
reasoneSchema.plugin(AutoIncrement, {
  id: "reasone_seq",
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n plugin
reasoneSchema.plugin(mongooseI18n, { locales: ["ar", "en"] });

export default mongoose.model("reasone", reasoneSchema);
