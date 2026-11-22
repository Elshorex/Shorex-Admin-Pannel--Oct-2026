
import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const assignRuleSchema = new Schema(
  {
    _id: {
      type: Number,
    },
    rule: {
      type: Number,
      ref: "rule",
      required: true,
    },
    user: {
      type: Number,
      ref: "user",
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

assignRuleSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// ✅ Replace auto-increment with mongoose-sequence
assignRuleSchema.plugin(AutoIncrement, {
  id: "assignRule_seq", // unique counter for this collection
  inc_field: "_id",
  start_seq: 1,
});

export default mongoose.model("assignRule", assignRuleSchema);
