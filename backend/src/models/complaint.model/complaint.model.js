import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const complaintSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
    },
    user: {
      type: Number,
      ref: "user",
    },
    firebaseToken: {
      type: String,
    },
    title: {
      type: String,
      i18n: true,
    },
    reasone: {
      type: Number,
      ref: "reasone",
    },
    number: {
      type: String,
    },
    respondingBy: {
      type: String,
      ref: "user",
    },
    notes: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    adminInformed: {
      type: Boolean,
      default: false,
    },
    userType: {
      type: String,
      enum: ["CLIENT", "INSTITUTION", "DRIVER", "VISITOR"],
      default: "CLIENT",
    },
    closed: {
      type: Boolean,
      default: false,
    },
    hasUnreadMessages: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Clean JSON output
complaintSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🌍 i18n
complaintSchema.plugin(mongooseI18n, { locales: ["ar", "en"] });

// 🔢 Auto-increment for _id
complaintSchema.plugin(AutoIncrement, {
  id: "complaint_seq", // unique sequence for complaint collection
  inc_field: "_id",
  start_seq: 1,
});

export default mongoose.model("complaint", complaintSchema);
