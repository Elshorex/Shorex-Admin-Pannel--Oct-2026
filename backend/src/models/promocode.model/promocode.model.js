import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";

const AutoIncrement = AutoIncrementFactory(mongoose);

const promocodeSchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    code: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    numberOfUse: {
      type: Number,
      required: true,
    },
    promoCodeType: {
      type: String,
      enum: ["RATIO", "VALUE"],
      default: "VALUE",
    },
    usersType: {
      type: String,
      enum: ["SPECIFIC", "ALL"],
      default: "ALL",
    },
    users: [
      {
        type: Number,
        ref: "user",
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
    promoCodeOn: {
      type: String,
      enum: ["TRANSPORTATION", "ALL", "PRODUCTS"],
      default: "ALL",
    },
    zones: [Number],
    institutions: [Number],
    products: [Number],
    categories: [Number],
    maxAmount: {
      type: Number,
    },
    deletedDate: {
      type: Date,
    },
    deletedUsers: [Number],
  },
  { timestamps: true }
);

// 🧹 Clean JSON output
promocodeSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment for promocode IDs
promocodeSchema.plugin(AutoIncrement, {
  id: "promocode_seq",
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n localization
promocodeSchema.plugin(mongooseI18n, { locales: ["en", "ar"] });

export default mongoose.model("promocode", promocodeSchema);
