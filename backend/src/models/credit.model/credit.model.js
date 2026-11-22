import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const CreditSchema = new Schema(
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
    holder: {
      type: String,
    },
    cardNumber: {
      type: String,
      required: true,
    },
    cvc: {
      type: String,
      required: true,
    },
    expireDateYear: {
      type: String,
      required: true,
    },
    expireDateMonth: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    paymentType: {
      type: String,
      enum: ["VISA", "MASTERCARD", "MADA"],
    },
  },
  { timestamps: true }
);

// ✅ JSON Transformation
CreditSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment with unique sequence
CreditSchema.plugin(AutoIncrement, {
  id: "credit_seq", // unique counter for credit model
  inc_field: "_id",
  start_seq: 1,
});

export default mongoose.model("credit", CreditSchema);
