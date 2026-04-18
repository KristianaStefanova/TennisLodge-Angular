const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const REQUEST_STATUSES = ['pending', 'accepted', 'rejected', 'cancelled'];

const accommodationRequestSchema = new mongoose.Schema({
  accommodationId: {
    type: ObjectId,
    ref: 'Accommodation',
    required: true,
  },
  requesterId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  numberOfGuests: { type: Number, required: true, min: 1, max: 500 },
  status: {
    type: String,
    enum: REQUEST_STATUSES,
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('AccommodationRequest', accommodationRequestSchema);
