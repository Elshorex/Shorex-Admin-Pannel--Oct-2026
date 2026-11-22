import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const { Schema } = mongoose;

const codeSchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    code: {
      type: String,
    },
    type: {
      type: String,
      enum: ["PASSWORD", "EMAIL", "PHONE"],
      default: "PASSWORD",
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ toJSON cleanup
codeSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment for `_id`
codeSchema.plugin(AutoIncrement, {
  id: "confirmationCode_seq", // unique sequence name
  inc_field: "_id",
  start_seq: 1,
});

export default mongoose.model("confirmationCode", codeSchema);
