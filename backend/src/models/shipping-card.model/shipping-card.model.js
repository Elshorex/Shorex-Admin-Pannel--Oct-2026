import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const shippingCardSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
    },
    value: {
      type: Number,
    },
    number: {
      type: String,
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedDate: {
      type: Date,
    },
    createdBy: {
      type: Number,
      ref: "user",
    },
    user: {
      type: Number,
      ref: "user",
    },
    // type: {
    //   type: String,
    //   enum: ["ORANGE", "BLUE"],
    //   default: "ORANGE",
    // },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 🧹 JSON transformer
shippingCardSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment (mongoose-sequence)
shippingCardSchema.plugin(AutoIncrement, {
  id: "shippingCard_seq", // unique sequence name
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n
shippingCardSchema.plugin(mongooseI18n, { locales: ["ar", "en"] });

export default mongoose.model("shippingCard", shippingCardSchema);
