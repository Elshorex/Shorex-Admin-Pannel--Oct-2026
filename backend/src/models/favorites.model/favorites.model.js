import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const favoritesSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    product: {
      type: Number,
      ref: "product",
    },
    trader: {
      type: Number,
      ref: "user",
    },
    user: {
      type: Number,
      required: true,
      ref: "user",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ JSON transformation
favoritesSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment with unique counter
favoritesSchema.plugin(AutoIncrement, {
  id: "favorites_seq", // unique counter for this collection
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n plugin
favoritesSchema.plugin(mongooseI18n, { locales: ["en", "ar"] });

export default mongoose.model("favorites", favoritesSchema);
