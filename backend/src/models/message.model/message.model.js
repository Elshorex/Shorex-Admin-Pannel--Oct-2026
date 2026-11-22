import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18nLocalize from "mongoose-i18n-localize";

const AutoIncrement = AutoIncrementFactory(mongoose);

const messageSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    sender: {
      type: Number,
      ref: "user",
    },
    firebaseToken: {
      type: String,
    },
    reciver: {
      user: { type: Number, ref: "user" },
      delivered: { type: Boolean, default: false },
      deliverDate: { type: Date },
      read: { type: Boolean, default: false },
      readDate: { type: Date },
      deleted: { type: Boolean, default: false },
    },
    message: {
      text: { type: String },
      image: { type: String },
      video: { type: String },
      document: { type: String },
      audio: { type: String },
      location: { lat: { type: String }, long: { type: String } },
    },
    playedBy: [Number],
    lastMessage: {
      type: Boolean,
      default: true,
    },
    messageType: {
      type: String,
      enum: ["NORMAL", "SUPPORT", "FAST"],
      default: "NORMAL",
    },
    fastOrderAction: {
      type: String,
      enum: [
        "CONFIRM_ORDER",
        "STARTTRIP",
        "CALL",
        "CREATE_INVOICE",
        "INVOICE_IMAGE",
        "DELIVERED",
        "DELIVERED_CONFIRMED",
      ],
    },
    activeChatHead: {
      type: Number,
      ref: "user",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    complaint: {
      type: Number,
      ref: "complaint",
    },
    order: {
      type: Number,
      ref: "order",
    },
  },
  { timestamps: true }
);

// ✅ Clean JSON output
messageSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment for _id
messageSchema.plugin(AutoIncrement, {
  id: "message_seq", // unique counter name
  inc_field: "_id",
  start_seq: 1,
});

// 🌐 i18n support
messageSchema.plugin(mongooseI18nLocalize, { locales: ["ar", "en"] });

export default mongoose.model("message", messageSchema);
