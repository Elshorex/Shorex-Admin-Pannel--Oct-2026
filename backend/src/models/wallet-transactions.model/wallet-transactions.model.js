import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";

const walletTransactionsSchema = new Schema({
    _id: {
        type: Number,
        // required: true
    },
    points: {
        type: Number,
        required: true
    },
    user: {
        type: Number,
        required: true,
        ref: 'user'
    },
    order: {
        type: Number
    },
    type: {
        type: String,
        enum: ['ORDER', 'SUM', 'SUBTRACT', 'ORDER_ADD']
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

walletTransactionsSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

// Initialize mongoose-sequence
const AutoIncrement = AutoIncrementFactory(mongoose);
walletTransactionsSchema.plugin(AutoIncrement, { 
    id: 'walletTransactions_seq',   // counter name
    inc_field: '_id', 
    start_seq: 1 
});

walletTransactionsSchema.plugin(mongooseI18n, { locales: ['ar','en'] });

export default mongoose.model('walletTransactions', walletTransactionsSchema);
