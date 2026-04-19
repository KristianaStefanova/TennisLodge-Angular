const { accommodationModel, accommodationRequestModel } = require('../models');
const mongoose = require('mongoose');

async function create(req, res, next) {
  try {
    const requesterId = req.user._id;
    const { accommodationId, numberOfGuests } = req.body;

    if (!accommodationId || !mongoose.Types.ObjectId.isValid(String(accommodationId))) {
      return res.status(400).json({ message: 'Valid accommodationId is required' });
    }
    if (typeof numberOfGuests !== 'number' || numberOfGuests < 1) {
      return res.status(400).json({ message: 'numberOfGuests must be at least 1' });
    }

    const acc = await accommodationModel.findOne({
      _id: accommodationId,
      isDeleted: false,
    });
    if (!acc) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    if (acc.ownerId.toString() === requesterId.toString()) {
      return res.status(400).json({ message: 'You cannot request your own accommodation' });
    }
    if (numberOfGuests > acc.maxGuests) {
      return res.status(400).json({
        message: `Number of guests cannot exceed host capacity (${acc.maxGuests})`,
      });
    }

    const doc = await accommodationRequestModel.create({
      accommodationId,
      requesterId,
      numberOfGuests,
      status: 'pending',
    });

    const populated = await accommodationRequestModel
      .findById(doc._id)
      .populate('requesterId', 'username firstName lastName')
      .populate('accommodationId', 'address maxGuests')
      .lean();

    return res.status(201).json(populated);
  } catch (err) {
    return next(err);
  }
}

function listMine(req, res, next) {
  const requesterId = req.user._id;
  accommodationRequestModel
    .find({ requesterId })
    .sort({ createdAt: -1 })
    .populate('accommodationId', 'address city checkInAt checkOutAt isDeleted maxGuests')
    .lean()
    .then((rows) => res.json(rows))
    .catch(next);
}

async function listIncomingForHost(req, res, next) {
  try {
    const ownerId = req.user._id;
    const listings = await accommodationModel.find({ ownerId, isDeleted: false }).select('_id').lean();
    const accIds = listings.map((a) => a._id);
    if (accIds.length === 0) {
      return res.json([]);
    }

    const rows = await accommodationRequestModel
      .find({ accommodationId: { $in: accIds } })
      .sort({ createdAt: -1 })
      .populate('requesterId', 'username firstName lastName')
      .populate('accommodationId', 'address city checkInAt checkOutAt isDeleted maxGuests')
      .lean();

    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

async function listForHost(req, res, next) {
  try {
    const { accommodationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(accommodationId)) {
      return res.status(400).json({ message: 'Invalid accommodation id' });
    }

    const acc = await accommodationModel.findOne({
      _id: accommodationId,
      isDeleted: false,
    });
    if (!acc) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    if (acc.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host can view these requests' });
    }

    const rows = await accommodationRequestModel
      .find({ accommodationId })
      .sort({ createdAt: -1 })
      .populate('requesterId', 'username firstName lastName')
      .lean();

    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const { status, message: rawMessage } = req.body;
    const allowed = ['accepted', 'rejected', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const doc = await accommodationRequestModel.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const acc = await accommodationModel.findOne({
      _id: doc.accommodationId,
      isDeleted: false,
    });
    if (!acc) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    const userId = req.user._id.toString();
    const isOwner = acc.ownerId.toString() === userId;
    const isRequester = doc.requesterId.toString() === userId;

    if (status === 'cancelled') {
      if (!isRequester || doc.status !== 'pending') {
        return res.status(403).json({ message: 'You can only cancel your own pending requests' });
      }
      doc.status = 'cancelled';
      await doc.save();
      const populated = await accommodationRequestModel
        .findById(doc._id)
        .populate('requesterId', 'username firstName lastName')
        .lean();
      return res.json(populated);
    }

    if (status === 'accepted' || status === 'rejected') {
      if (!isOwner) {
        return res.status(403).json({ message: 'Only the host can accept or reject requests' });
      }
      if (doc.status !== 'pending') {
        return res.status(400).json({ message: 'Request is no longer pending' });
      }
      let hostMessage = '';
      if (rawMessage != null) {
        if (typeof rawMessage !== 'string') {
          return res.status(400).json({ message: 'message must be a string' });
        }
        hostMessage = rawMessage.trim().slice(0, 500);
      }
      doc.status = status;
      doc.hostMessage = hostMessage;
      doc.guestOutcomeUnread = true;
      await doc.save();
      const populated = await accommodationRequestModel
        .findById(doc._id)
        .populate('requesterId', 'username firstName lastName')
        .lean();
      return res.json(populated);
    }

    return res.status(400).json({ message: 'Unsupported operation' });
  } catch (err) {
    return next(err);
  }
}

async function markGuestOutcomesRead(req, res, next) {
  try {
    const requesterId = req.user._id;
    const result = await accommodationRequestModel.updateMany(
      { requesterId, guestOutcomeUnread: true },
      { $set: { guestOutcomeUnread: false } },
    );
    return res.json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    return next(err);
  }
}

async function counts(req, res, next) {
  try {
    const userId = req.user._id;

    const [pendingSent, unreadGuestOutcomes, listings] = await Promise.all([
      accommodationRequestModel.countDocuments({
        requesterId: userId,
        status: 'pending',
      }),
      accommodationRequestModel.countDocuments({
        requesterId: userId,
        guestOutcomeUnread: true,
      }),
      accommodationModel.find({ ownerId: userId, isDeleted: false }).select('_id').lean(),
    ]);

    const accIds = listings.map((a) => a._id);
    let pendingReceived = 0;
    if (accIds.length > 0) {
      pendingReceived = await accommodationRequestModel.countDocuments({
        accommodationId: { $in: accIds },
        status: 'pending',
      });
    }

    return res.json({
      pendingSent,
      pendingReceived,
      unreadGuestOutcomes,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  counts,
  markGuestOutcomesRead,
  listMine,
  listIncomingForHost,
  listForHost,
  updateStatus,
};
