import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const introSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      i18n: true,
    },
    text: {
      type: String,
      i18n: true,
    },
    image: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Clean JSON output
introSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment unique counter
introSchema.plugin(AutoIncrement, {
  id: "intro_seq", // counter name
  inc_field: "_id",
  start_seq: 1,
});

// 🌐 i18n support
introSchema.plugin(mongooseI18n, { locales: ["en", "ar"] });

export default mongoose.model("intro", introSchema);
