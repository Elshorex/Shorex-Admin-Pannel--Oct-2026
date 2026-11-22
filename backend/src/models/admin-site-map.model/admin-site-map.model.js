
import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

// initialize mongoose-sequence with current mongoose instance
const AutoIncrement = AutoIncrementFactory(mongoose);

const adminSiteMapSchema = new Schema(
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
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

adminSiteMapSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// ✅ Use mongoose-sequence plugin
adminSiteMapSchema.plugin(AutoIncrement, {
  id: "adminSiteMap_seq", // unique counter name
  inc_field: "_id",
  start_seq: 1,
});

adminSiteMapSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model("adminSiteMap", adminSiteMapSchema);
