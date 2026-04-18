const { accommodationModel, tournamentModel } = require('../models');
const mongoose = require('mongoose');
const { PUBLIC_TRANSPORT_TYPES } = require('../constants/accommodationConstants');

function normalizePublicTransportTypes(hasNearby, rawTypes) {
  if (!hasNearby) {
    return [];
  }
  if (!Array.isArray(rawTypes)) {
    return null;
  }
  const unique = [...new Set(rawTypes.filter((t) => typeof t === 'string'))];
  if (!unique.every((t) => PUBLIC_TRANSPORT_TYPES.includes(t))) {
    return null;
  }
  return unique;
}

function validateAccommodationLocationAndTransport(payload) {
  const city = String(payload.city ?? '').trim();
  const postalCode = String(payload.postalCode ?? '').trim();
  if (!city) {
    return { message: 'City or town is required.' };
  }
  if (!postalCode) {
    return { message: 'Postal code is required.' };
  }
  if (payload.hasPublicTransportNearby == null) {
    payload.hasPublicTransportNearby = false;
  } else if (payload.hasPublicTransportNearby !== true && payload.hasPublicTransportNearby !== false) {
    return { message: 'Please indicate whether there is public transport nearby (yes or no).' };
  }
  const types = normalizePublicTransportTypes(
    payload.hasPublicTransportNearby,
    payload.publicTransportTypes,
  );
  if (types === null) {
    return { message: 'Invalid public transport type selection.' };
  }
  if (payload.hasPublicTransportNearby && types.length === 0) {
    return {
      message: 'When public transport is available nearby, select at least one option (e.g. bus, metro).',
    };
  }
  payload.city = city;
  payload.postalCode = postalCode;
  payload.publicTransportTypes = types;
  return null;
}

function validateStayDates(checkInAt, checkOutAt) {
  const start = new Date(checkInAt);
  const end = new Date(checkOutAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Invalid dates';
  }
  if (end <= start) {
    return 'Check-out must be after check-in';
  }
  return null;
}

function getAll(req, res, next) {
  accommodationModel
    .find({ isDeleted: false })
    .sort({ checkInAt: 1 })
    .populate('tournamentId', 'tournamentName')
    .lean()
    .then((rows) => res.json(rows))
    .catch(next);
}

function getMine(req, res, next) {
  const ownerId = req.user._id;
  accommodationModel
    .find({ ownerId, isDeleted: false })
    .sort({ updatedAt: -1 })
    .populate('tournamentId', 'tournamentName')
    .lean()
    .then((rows) => res.json(rows))
    .catch(next);
}

function getById(req, res, next) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  accommodationModel
    .findOne({ _id: id, isDeleted: false })
    .populate('tournamentId', 'tournamentName tournamentStartDate tournamentEndDate')
    .lean()
    .then((doc) => {
      if (!doc) {
        return res.status(404).json({ message: 'Accommodation not found' });
      }
      return res.json(doc);
    })
    .catch(next);
}

async function create(req, res, next) {
  try {
    const ownerId = req.user._id;
    const payload = { ...req.body, ownerId };
    delete payload._id;

    const dateErr = validateStayDates(payload.checkInAt, payload.checkOutAt);
    if (dateErr) {
      return res.status(400).json({ message: dateErr });
    }

    if (payload.tournamentId === '' || payload.tournamentId == null) {
      delete payload.tournamentId;
    } else if (!mongoose.Types.ObjectId.isValid(String(payload.tournamentId))) {
      return res.status(400).json({ message: 'Invalid tournament id' });
    } else {
      const t = await tournamentModel.findOne({
        _id: payload.tournamentId,
        isDeleted: false,
      }).lean();
      if (!t) {
        return res.status(400).json({ message: 'Tournament not found' });
      }
    }

    if (typeof payload.maxGuests !== 'number' || payload.maxGuests < 1) {
      return res.status(400).json({ message: 'maxGuests must be at least 1' });
    }

    if (
      typeof payload.distanceToCourtsMeters !== 'number' ||
      !Number.isFinite(payload.distanceToCourtsMeters) ||
      payload.distanceToCourtsMeters < 0
    ) {
      return res.status(400).json({ message: 'Distance to courts must be a non-negative number.' });
    }

    const locErr = validateAccommodationLocationAndTransport(payload);
    if (locErr) {
      return res.status(400).json({ message: locErr.message });
    }

    const doc = await accommodationModel.create(payload);
    const populated = await accommodationModel
      .findById(doc._id)
      .populate('tournamentId', 'tournamentName')
      .lean();
    return res.status(201).json(populated);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const doc = await accommodationModel.findById(id);
    if (!doc || doc.isDeleted) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    if (doc.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own accommodations' });
    }

    const patch = { ...req.body };
    delete patch._id;
    delete patch.ownerId;

    if (patch.tournamentId === '' || patch.tournamentId == null) {
      patch.tournamentId = null;
    } else if (patch.tournamentId != null) {
      if (!mongoose.Types.ObjectId.isValid(String(patch.tournamentId))) {
        return res.status(400).json({ message: 'Invalid tournament id' });
      }
      const t = await tournamentModel.findOne({
        _id: patch.tournamentId,
        isDeleted: false,
      }).lean();
      if (!t) {
        return res.status(400).json({ message: 'Tournament not found' });
      }
    }

    Object.assign(doc, patch);

    const mergedPayload = doc.toObject();
    if (
      typeof mergedPayload.distanceToCourtsMeters !== 'number' ||
      !Number.isFinite(mergedPayload.distanceToCourtsMeters) ||
      mergedPayload.distanceToCourtsMeters < 0
    ) {
      return res.status(400).json({ message: 'Distance to courts must be a non-negative number.' });
    }
    const locErr = validateAccommodationLocationAndTransport(mergedPayload);
    if (locErr) {
      return res.status(400).json({ message: locErr.message });
    }
    Object.assign(doc, {
      city: mergedPayload.city,
      postalCode: mergedPayload.postalCode,
      hasPublicTransportNearby: mergedPayload.hasPublicTransportNearby,
      publicTransportTypes: mergedPayload.publicTransportTypes,
    });

    const checkIn = doc.checkInAt;
    const checkOut = doc.checkOutAt;
    const dateErr = validateStayDates(checkIn, checkOut);
    if (dateErr) {
      return res.status(400).json({ message: dateErr });
    }

    const saved = await doc.save();
    const populated = await accommodationModel
      .findById(saved._id)
      .populate('tournamentId', 'tournamentName')
      .lean();
    return res.json(populated);
  } catch (err) {
    return next(err);
  }
}

function remove(req, res, next) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  accommodationModel
    .findById(id)
    .then((doc) => {
      if (!doc || doc.isDeleted) {
        return res.status(404).json({ message: 'Accommodation not found' });
      }
      if (doc.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only delete your own accommodations' });
      }
      doc.isDeleted = true;
      return doc.save().then(() => res.status(204).send());
    })
    .catch(next);
}

module.exports = {
  getAll,
  getMine,
  getById,
  create,
  update,
  remove,
};
