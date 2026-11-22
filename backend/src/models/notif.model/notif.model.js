import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18nLocalize from "mongoose-i18n-localize";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const NotifSchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    notificationType: {
      type: String,
      enum: ["GROUP", "SINGLE_USER"],
    },
    resource: {
      type: Number,
      ref: "user",
    },
    readBy: {
      type: [Number],   // store users who have read this notification
      ref: "user",
      default: []
    },
    target: {
      type: Number,
      ref: "user",
    },
    title: {
      type: String,
      i18n: true,
    },
    description: {
      type: String,
      i18n: true,
    },
    userType: {
      type: String,
      enum: ["ALL", ...config.types],
    },
    users: {
      type: [Number],
      ref: "user",
    },
    sendDate: {
      type: Date,
    },
    image: {
      type: String,
    },
    subject: {
      type: Number,
    },
    subjectType: {
      type: String,
      enum: [
        "ADMIN",
        "USER",
        "CONTACTUS",
        "ORDER",
        "CHANGE_ORDER_STATUS",
        "PROMOCODE",
        "ADDED_TO_WALLET",
      ],
      default: "ADMIN",
    },
    usersDeleted: {
      type: [Number],
      ref: "user",
    },
    read: {
      type: Boolean,
      default: false,
    },
    informed: {
      type: [Number],
    },
    deletedDate: {
      type: Date,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Transform JSON output
NotifSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment _id
NotifSchema.plugin(AutoIncrement, {
  id: "notif_seq", // unique counter for notif
  inc_field: "_id",
  start_seq: 1,
});

// 🌐 i18n support
NotifSchema.plugin(mongooseI18nLocalize, { locales: config.locals });

export default mongoose.model("notif", NotifSchema);
