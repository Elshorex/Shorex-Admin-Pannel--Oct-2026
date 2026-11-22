import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from '../../config.js';

const warehouseSchema = new Schema({
    _id: {
        type: Number,
        // required: true
    },
    products: {
        type: [{
            product: Number,
            stock: { type: Number, default: 0 }
        }]
    },
    name: {
        type: String
    },
    totalStock: {
        type: Number,
        default: 0
    },
    address: {
        type: String
    },
    notes: {
        type: String
    },
    provider: {
        type: Number,
        ref: 'user'
    },
    storeKeeper: {
        type: Number,
        ref: 'user'
    },
    // ---------------- Common ----------------
    country: { type: Number, ref: "country" },
    region: [{ type: Number, ref: "region" }],
    city: [{ type: Number, ref: "city" }],
    areas: [{ type: Number, ref: "area" }],
    requests: [{ type: Number, ref: "request" }],

    startAt: Date,
    status: {
        type: Number,
        default: 1
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

warehouseSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

// Initialize mongoose-sequence
const AutoIncrement = AutoIncrementFactory(mongoose);
warehouseSchema.plugin(AutoIncrement, { 
    id: 'warehouse_seq',   // unique counter name
    inc_field: '_id',
    start_seq: 1 
});

warehouseSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model('warehouse', warehouseSchema);
