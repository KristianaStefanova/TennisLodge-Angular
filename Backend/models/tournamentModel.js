const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const tournamentSchema = new mongoose.Schema({
  tournamentName: { type: String, required: true, trim: true },
  tournamentOrganizer: { type: String, required: true, trim: true },
  tournamentCategory: { type: String, required: true, trim: true },
  tournamentStartDate: { type: Date, required: true },
  tournamentEndDate: { type: Date, required: true },
  tournamentLocation: { type: String, required: true, trim: true },
  tournamentSurface: { type: String, required: true, trim: true },
  tournamentContact: { type: String, default: '', trim: true },
  tournamentEmail: { type: String, default: '', trim: true },
  tournamentImageUrl: { type: String, default: '', trim: true },
  isDeleted: { type: Boolean, default: false },
  ownerId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
