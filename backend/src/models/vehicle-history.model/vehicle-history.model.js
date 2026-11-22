import mongoose, { Schema } from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import AutoIncrementFactory from "mongoose-sequence";
import config from '../../config.js';

const AutoIncrement = AutoIncrementFactory(mongoose);

const vehicleHistorySchema = new Schema({
    _id: {
        type: Number
    },
    startAt: {
        type: Date,
        default: Date.now
    },
    endAt: {
        type: Date,
        validate: {
            validator: function(value) {
                return !this.startAt || value >= this.startAt;
            },
            message: 'endAt must be after startAt'
        }
    },
    vehicle: {
        type: Number,
        ref: 'vehicle',
        required: true
    },
    driver: {
        type: Number,
        ref: 'user',
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// JSON transform
vehicleHistorySchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

// Indexes
vehicleHistorySchema.index({ vehicle: 1 });
vehicleHistorySchema.index({ driver: 1 });

// Virtual for active check
vehicleHistorySchema.virtual('isActive').get(function () {
    return !this.endAt || this.endAt > new Date();
});

// Apply mongoose-sequence plugin
vehicleHistorySchema.plugin(AutoIncrement, { inc_field: "_id", id: "vehicleHistory_seq" });

// i18n plugin
vehicleHistorySchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model('vehicleHistory', vehicleHistorySchema);
