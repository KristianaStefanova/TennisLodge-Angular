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
  /** Optional note from host when accepting or rejecting; visible to the guest. */
  hostMessage: { type: String, default: '', trim: true, maxlength: 500 },
  /** Guest has not yet opened “Requests I sent” after host accepted/rejected. */
  guestOutcomeUnread: { type: Boolean, default: false },
}, { timestamps: true });

accommodationRequestSchema.index({ accommodationId: 1, createdAt: -1 });
accommodationRequestSchema.index({ requesterId: 1, status: 1 });
accommodationRequestSchema.index({ accommodationId: 1, status: 1 });
accommodationRequestSchema.index({ requesterId: 1, guestOutcomeUnread: 1 });

module.exports = mongoose.model('AccommodationRequest', accommodationRequestSchema);
