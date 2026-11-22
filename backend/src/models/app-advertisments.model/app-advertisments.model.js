import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const advertismentsSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

advertismentsSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// ✅ Use mongoose-sequence for auto-increment
advertismentsSchema.plugin(AutoIncrement, {
  id: "appadvertisments_seq", // counter name (unique per model)
  inc_field: "_id",
  start_seq: 1,
});

export default mongoose.model("appadvertisments", advertismentsSchema);
