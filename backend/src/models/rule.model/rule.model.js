import mongoose, { Schema } from "mongoose";
import mongooseI18nLocalize from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const rulesSchema = new Schema(
  {
    _id: {
      type: Number,
    },
    name: {
      type: String,
      required: true,
      i18n: true,
    },
    number: {
      type: Number,
      required: true,
    },
    properties: {
      type: [String],
      enum: ["ADD", "UPDATE", "SHOW", "DELETE", "STATUS"],
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🧹 JSON transformer
rulesSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment plugin
rulesSchema.plugin(AutoIncrement, {
  id: "rule_seq", // unique sequence counter
  inc_field: "_id",
  start_seq: 1,
});

// 🌍 i18n plugin
rulesSchema.plugin(mongooseI18nLocalize, { locales: ["en", "ar"] });

export default mongoose.model("rule", rulesSchema);
