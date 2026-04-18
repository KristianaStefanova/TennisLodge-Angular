const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const { PUBLIC_TRANSPORT_TYPES } = require('../constants/accommodationConstants');

const accommodationSchema = new mongoose.Schema({
  checkInAt: { type: Date, required: true },
  checkOutAt: { type: Date, required: true },
  city: { type: String, default: '', trim: true },
  postalCode: { type: String, default: '', trim: true },
  hasPublicTransportNearby: { type: Boolean, default: false },
  publicTransportTypes: {
    type: [{ type: String, enum: PUBLIC_TRANSPORT_TYPES }],
    default: [],
  },
  additionalDescription: { type: String, default: '', trim: true },
  houseRules: { type: String, default: '', trim: true },
  distanceToCourtsMeters: { type: Number, required: true, min: 0 },
  address: { type: String, required: true, trim: true },
  maxGuests: { type: Number, required: true, min: 1, max: 500 },
  photoUrl: { type: String, default: '', trim: true },
  tournamentId: {
    type: ObjectId,
    ref: 'Tournament',
    default: null,
  },
  isDeleted: { type: Boolean, default: false },
  ownerId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

accommodationSchema.index({ ownerId: 1, isDeleted: 1, updatedAt: -1 });

module.exports = mongoose.model('Accommodation', accommodationSchema);
