import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import mongooseI18n from "mongoose-i18n-localize";

const AutoIncrement = AutoIncrementFactory(mongoose);

let propertySchema = new Schema({
  property: { type: String, i18n: true },
  price: Number,
});

let productSchema = new Schema({
  product: { type: Number },
  volum: propertySchema,
  test: propertySchema,
  size: propertySchema,
  color: propertySchema,
  otherProperty: [
    { name: { type: String, i18n: true }, properties: [propertySchema] },
  ],
  notes: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  offer: { type: Number },
  priceAfterOffer: { type: Number },
});

let coordinateSchema = new Schema({
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  address: { type: String, default: "El-Haram streat" },
});

let addressSchema = new Schema({
  carType: { type: String },
  carColor: { type: String },
  plateNumber: { type: String },
  phoneNumber: { type: String },
});

const orderSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["NORMAL", "BOOKING"],
      default: "NORMAL",
    },
    pickupMethod: {
      type: String,
      enum: ["BRANCH", "CAR"],
      default: "BRANCH",
    },
    branch: Number,
    notes: { type: String },

    numberOfGuests: Number,
    date: Date,
    time: Number,

    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    specialRequests: String,

    refunded: Boolean,
    user: {
      type: Number,
      ref: "user",
      required: true,
    },
    carDetails: addressSchema,
    driver: { type: Number, ref: "user" },
    driverAssignDate: Date,
    traderAssignDate: { type: Date, default: Date.now() },
    products: { type: [productSchema] },
    lastLocation: coordinateSchema,
    promoCode: { type: Number, ref: "promocode" },
    paymentMethod: {
      type: String,
      enum: ["WALLET", "CASH", "POINTS", "MADA", "VISA", "APPLE_PAY", "STC"],
    },
    points: Number,
    acceptedUser: Number,
    rewardPointPer: { type: Number, default: 0 },
    orderPointPrice: Number,
    paymentPhoneNumber: String,
    status: {
      type: String,
      enum: [
        "WAITING",
        "ACCEPTED",
        "TRADER_CANCELED",
        "CLIENT_CANCELED",
        "ADMIN_CANCELED",
        "DELIVERED",
        "REJECTED",
        "DRIVER_ACCEPTED",
        "PREPARED",
        "SHIPPED",
        "NOT_ASSIGN",
      ],
      default: "WAITING",
    },
    traderRejected: { type: Boolean, default: false },

    convertedMoney: Number,
    invoiceImage: String,
    price: Number,
    totalPrice: Number,
    finalPrice: Number,
    taxes: Number,
    orderNumber: { type: String, required: true },
    adminInformed: { type: Boolean, default: false },
    discountValue: Number,
    promoCodeOn: { type: String, enum: ["TRANSPORTATION", "ALL", "PRODUCTS"] },
    trader: { type: Number, ref: "user" },
    rejectReason: String,
    traderCancelReasone: String,
    clientCancelReasone: String,
    adminCancelReasone: String,

    traderRateEmotion: {
      type: String,
      enum: ["BAD", "GOOD", "EXCELLENT"],
    },
    traderRateDate: Date,
    traderRateValue: Number,
    traderRateComment: String,

    productsTaxes: Number,
    order: Number,

    acceptedDate: Date,
    traderRejectedDate: Date,
    rejectedDate: Date,
    driverAcceptedDate: Date,
    prepareDate: Date,
    shippedDate: Date,
    deliveredDate: Date,
    clientCancelDate: Date,
    traderCancelDate: Date,
    adminCancelDate: Date,

    paymentTransaction: {
      type: Number,
      ref: "paymentTransaction",
    },
  },
  { timestamps: true }
);

orderSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// 🔢 Auto-increment _id
orderSchema.plugin(AutoIncrement, {
  id: "order_seq",
  inc_field: "_id",
  start_seq: 1,
});

// 🌐 i18n support
orderSchema.plugin(mongooseI18n, { locales: ["ar", "en"] });

export default mongoose.model("order", orderSchema);
