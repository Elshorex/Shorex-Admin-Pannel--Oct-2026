import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const claimRequestSchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    customer: {
      type: Number,
    },
    provider: {
      type: Number,
    },
    requests: {
      type: [Number],
    },
    changeStatusDate: Date,
    cancelDate: Date,
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELED"],
      default: "PENDING",
    },
    redeemAmount: {
      type: Number,
    },
    donationAmount: {
      type: Number,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedDate: {
      type: Date,
    },
    deletedBy: {
      type: Number,
    },
  },
  { timestamps: true }
);

claimRequestSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🌍 Localization
claimRequestSchema.plugin(mongooseI18n, { locales: config.locals });

// 🔢 Auto-increment (_id) with mongoose-sequence
claimRequestSchema.plugin(AutoIncrement, {
  id: "claimRequest_seq", // unique counter name for this collection
  inc_field: "_id",
  start_seq: 1,
});

export default mongoose.model("claimRequest", claimRequestSchema);
