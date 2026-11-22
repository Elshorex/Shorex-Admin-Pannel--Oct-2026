import mongoose, { Schema } from 'mongoose';
import mongooseI18n from 'mongoose-i18n-localize';
import AutoIncrementFactory from 'mongoose-sequence';

const zoneSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        i18n: true
    },
    currentDriverLocation: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    radius: {
        type: Number /// in meters
    },
    trader: {
        type: Number
    },
    isTraderDefault: {
        type: Boolean
    },
    driver: {
        type: Number
    }
}, { timestamps: true });

zoneSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.password;
        delete ret._id;
        delete ret.__v;
    }
});

// Indexes for geospatial queries
zoneSchema.index({ location: "2dsphere" });
zoneSchema.index({ currentDriverLocation: "2dsphere" });

// Initialize mongoose-sequence
const AutoIncrement = AutoIncrementFactory(mongoose);
zoneSchema.plugin(AutoIncrement, { 
    id: 'zone_seq',   // unique counter for zone
    inc_field: '_id',
    start_seq: 1 
});

// i18n plugin
zoneSchema.plugin(mongooseI18n, { locales: ['en', 'ar'] });

export default mongoose.model('zone', zoneSchema);
