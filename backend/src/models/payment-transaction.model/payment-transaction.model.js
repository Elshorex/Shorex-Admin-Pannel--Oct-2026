
import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";

const AutoIncrement = AutoIncrementFactory(mongoose);

const paymentTransactionSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    user: {
      type: Number,
      required: true,
      ref: "user",
    },
    paymentMethod: {
      type: String,
      enum: ["MADA", "VISA", "APPLE_PAY", "STC"],
    },
    transactionType: {
      type: String,
      enum: ["PURCHASE", "REFUND", "POCKET"],
      default: "PURCHASE",
    },
    order: {
      type: Number,
      ref: "order",
    },
    orderNumber: {
      type: String,
    },
    paymentToken: {
      type: String, // returned from payment company (step 3)
    },
    amount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["WAITING", "SUCCESS", "FAILES"],
      default: "WAITING",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🔄 Transform JSON output
paymentTransactionSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment _id
paymentTransactionSchema.plugin(AutoIncrement, {
  id: "paymentTransaction_seq",
  inc_field: "_id",
  start_seq: 1,
});

// 🌐 i18n support
paymentTransactionSchema.plugin(mongooseI18n, { locales: ["en", "ar"] });

export default mongoose.model("paymentTransaction", paymentTransactionSchema);
