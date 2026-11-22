
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import isEmail from "validator/lib/isEmail.js";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from "../../config.js";

const AutoIncrement = AutoIncrementFactory(mongoose);

const userSchema = new Schema(
  {
    _id: {
      type: Number,
      // required: true,
    },
    name: { type: String },
    lastName: { type: String },
    password: { type: String },
    phone: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
      validate: {
        validator: (email) => isEmail(email),
        message: "Invalid Email Syntax",
      },
    },
    type: {
      type: String,
      enum: config.types,
      required: true,
      default: "CLIENT",
    },
    role: { type: Number },
    userId: { type: Number },
    status: { type: Number, default: 1 },
    deleted: { type: Boolean, default: false },
    tokens: [
      {
        token: { type: String, required: true },
        type: { type: String, required: true, enum: ["ios", "android", "web"] },
      },
    ],
    activated: { type: Boolean, default: true },
    rules: { type: [Number], ref: "assignRule" },
    image: { type: String },
    language: { type: String, default: "en", enum: ["ar", "en"] },
    notification: { type: Boolean, default: true },
    socialId: { type: String },
    socialMediaType: {
      type: String,
      enum: ["NORMAL", "FACEBOOK", "TWITTER", "INSTAGRAM", "GOOGLE", "APPLE"],
      default: "NORMAL",
    },
    // ---------------- Common ----------------
    country: { type: Number, ref: "country" },
    region: [{ type: Number, ref: "region" }],
    city: [{ type: Number, ref: "city" }],
    // area: { type: Number, ref: "area" },
    areas: [{ type: Number, ref: "area" }],

    // ---------------- Customer ----------------
    code: { type: String },
    bussinessName: { type: String },
    category: { type: Number, ref: "category" },
    joinDate: { type: Date },
    landlineNumber: { type: String },
    // region: { type: Number, ref: "region" },
    postalCode: { type: String },
    streetName: { type: String },
    buildingNumber: { type: String },
    address: { type: String },
    inchargePersonName: { type: String },
    inchargePersonPhone: { type: String },
    staffInCharge: { type: String },
    accountHolderName: { type: String },
    hasDeposit: { type: Boolean },
    depositDescription: { type: String },
    specialReward: [{ product: Number, reward: Number }],

    // ---------------- Provider ----------------
    contactPersonName: { type: String },
    contactPersonLandline: { type: String },
    contactPersonPhone: { type: String },
    location: { type: String },
    nif: { type: String },
    products: [Number],

    // ---------------- StoreKeeper ----------------
    bankName: { type: String },
    iban: { type: String },
    managerId: { type: String },
    notes: { type: String },

    // ---------------- Driver ----------------
    provider: { type: Number },
    vehicles: [
      {
        vehicle: { type: Number },
        joinDate: { type: Date, default: Date.now },
      },
    ],
    driverId: { type: String },
    licenceNumber: { type: String },
    startAt: Date,
    idImage: String,
    licenceImage: String,

    // ---------------- Wallet / Points ----------------
    wallet: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    walletAdded: { type: Number, default: 0 },
    walletSubtracted: { type: Number, default: 0 },
    pointsAdded: { type: Number, default: 0 },
    pendingPoints: { type: Number, default: 0 },
    pendingWallet: { type: Number, default: 0 },
    pointsSubtracted: { type: Number, default: 0 },

    // ---------------- Email ----------------
    emailToken: { type: String },
    emailTokenDate: { type: Date },

    // ---------------- Password ----------------
    isPasswordSet: { type: Boolean, default: true },

    // ---------------- Account Deletion Request ----------------
    deletionRequested: { type: Boolean, default: false },
    deletionRequestReason: { type: String },
    deletionRequestDate: { type: Date },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
userSchema.pre("save", function (next) {
  const account = this;
  if (!account.isModified("password")) return next();
  const salt = bcrypt.genSaltSync();
  bcrypt
    .hash(account.password, salt)
    .then((hash) => {
      account.password = hash;
      next();
    })
    .catch((err) => console.error(err));
});

// 🔐 Validate password
userSchema.methods.isValidPassword = function (newPassword, callback) {
  let user = this;
  bcrypt.compare(newPassword, user.password, function (err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

// JSON Transform
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.password;
    delete ret._id;
    delete ret.__v;
  },
});

// 🌍 i18n
userSchema.plugin(mongooseI18n, { locales: config.locals });

// 🔢 Auto-increment with mongoose-sequence
userSchema.plugin(AutoIncrement, {
  id: "user_seq", // counter name
  inc_field: "_id",
  // inc_field: "userId",
  start_seq: 1,
});

export default mongoose.model("user", userSchema);
