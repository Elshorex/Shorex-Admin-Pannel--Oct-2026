
import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const categorySchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    name: {
      type: String,
      i18n: true,
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

categorySchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment with mongoose-sequence
categorySchema.plugin(AutoIncrement, {
  id: "category_seq", // unique sequence name
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n support
categorySchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("category", categorySchema);
