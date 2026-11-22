import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const hashSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    token: {
      type: String,
      required: true,
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

// ✅ Transform output JSON
hashSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment unique counter
hashSchema.plugin(AutoIncrement, {
  id: "hash_seq", // unique counter name for this collection
  inc_field: "_id",
  start_seq: 1,
});

export default mongoose.model("hash", hashSchema);
