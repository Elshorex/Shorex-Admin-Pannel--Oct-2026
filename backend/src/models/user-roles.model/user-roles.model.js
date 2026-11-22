import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const userRoleSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      i18n: true,
    },
    parent: {
      type: Number,
    },
    status: {
      type: Number,
    },
    type: {
      type: String,
      enum: config.types,
    },
    sitePages: [Number],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userRoleSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment `_id`
userRoleSchema.plugin(AutoIncrement, {
  id: "userRole_seq", // unique counter name
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n localization
userRoleSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("userRole", userRoleSchema);
