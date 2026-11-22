
import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const addressSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    addressName: {
      type: String,
    },
    region: {
      type: Number,
      //ref: 'region'
    },
    street: {
      type: String,
    },
    buildingNumber: {
      type: String,
    },
    flatNumber: {
      type: String,
    },
    long: {
      type: Number,
    },
    lat: {
      type: Number,
    },
    address: {
      type: String,
    },
    geoLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number], // default: [30.98758, 30.867589]
      },
    },
    user: {
      type: Number,
      ref: "user",
    },
    active: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
    },
    details: {
      type: String,
    },
  },
  { timestamps: true }
);

addressSchema.pre("save", function (next) {
  const address = this;
  if (!address.isModified("lat")) return next();
  address.geoLocation = {
    type: "Point",
    coordinates: [address.long, address.lat],
  };
  next();
});

addressSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// ✅ Replace autoIncrement with mongoose-sequence
addressSchema.plugin(AutoIncrement, {
  id: "address_seq", // unique counter ID
  inc_field: "_id", // field to auto-increment
  start_seq: 1, // starting value
});

addressSchema.plugin(mongooseI18n, { locales: ["ar", "en"] });

export default mongoose.model("address", addressSchema);
