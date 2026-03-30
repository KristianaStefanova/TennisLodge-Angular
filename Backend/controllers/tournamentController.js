const { tournamentModel } = require('../models');
const mongoose = require('mongoose');

function getAll(req, res, next) {
  tournamentModel
    .find({ isDeleted: false })
    .sort({ tournamentStartDate: 1 })
    .lean()
    .then((rows) => res.json(rows))
    .catch(next);
}

function getById(req, res, next) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  tournamentModel
    .findOne({ _id: id, isDeleted: false })
    .lean()
    .then((doc) => {
      if (!doc) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
      return res.json(doc);
    })
    .catch(next);
}

function create(req, res, next) {
  const ownerId = req.user._id;
  const payload = { ...req.body, ownerId };
  delete payload._id;
  tournamentModel
    .create(payload)
    .then((doc) => res.status(201).json(doc))
    .catch(next);
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const doc = await tournamentModel.findById(id);
    if (!doc || doc.isDeleted) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    if (doc.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own tournaments' });
    }
    const patch = { ...req.body };
    delete patch._id;
    delete patch.ownerId;
    Object.assign(doc, patch);
    const saved = await doc.save();
    return res.json(saved);
  } catch (err) {
    return next(err);
  }
}

function remove(req, res, next) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  tournamentModel
    .findById(id)
    .then((doc) => {
      if (!doc || doc.isDeleted) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
      if (doc.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only delete your own tournaments' });
      }
      doc.isDeleted = true;
      return doc.save().then(() => res.status(204).send());
    })
    .catch(next);
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
