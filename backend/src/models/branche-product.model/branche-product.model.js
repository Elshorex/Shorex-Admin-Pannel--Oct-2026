import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const branchProductSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    branch: {
      type: Number,
    },
    product: {
      type: Number,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

branchProductSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🌍 i18n support
branchProductSchema.plugin(mongooseI18n, { locales: ["en", "ar"] });

// 🔢 Auto-increment using mongoose-sequence
branchProductSchema.plugin(AutoIncrement, {
  id: "branchProduct_seq", // unique counter name
  inc_field: "_id",
  start_seq: 1,
});

export default mongoose.model("branchProduct", branchProductSchema);
