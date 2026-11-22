import mongoose,{ Schema} from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from '../../config.js';

const vehicleSchema = new Schema({
    _id: {
        type: Number,
        // required: true
    },
    provider: {
        type: Number,
        ref: 'provider' // if you have a provider model
    },
    name: {
        type: String
    },
    vehicleNumber: {
        type: String,
        unique: true, // usually vehicle numbers should be unique
        trim: true
    },
    trademark: {
        type: String
    },
    chassisNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    engineNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    model: {
        type: String
    },
    docs: [String],
    notes: {
        type: String
    },
    drivers: [{
        type: Number,
        ref: 'user' // or driver model
    }],
    status: {
        type: Number
    },
    softDeleted: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

vehicleSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

// Initialize mongoose-sequence
const AutoIncrement = AutoIncrementFactory(mongoose);
vehicleSchema.plugin(AutoIncrement, { id: 'vehicle_seq', inc_field: '_id', start_seq: 1 });
vehicleSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model('vehicle', vehicleSchema);
