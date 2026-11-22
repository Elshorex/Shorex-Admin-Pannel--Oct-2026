import mongoose, { Schema } from "mongoose";
import mongooseI18nLocalize from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const issueSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    advertisment: {
      type: Number,
      ref: "advertisment",
    },
    user: {
      type: Number,
      ref: "user",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
    },
    adminSeen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Clean JSON output
issueSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment for _id
issueSchema.plugin(AutoIncrement, {
  id: "issue_seq",   // unique counter name
  inc_field: "_id",
  start_seq: 1,
});

// 🌐 i18n plugin
issueSchema.plugin(mongooseI18nLocalize, { locales: ["en", "ar"] });

export default mongoose.model("issue", issueSchema);
