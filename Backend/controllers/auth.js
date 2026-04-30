const fs = require('fs');
const path = require('path');
const {
    userModel,
    tokenBlacklistModel
} = require('../models');
const { profileUploadsDir } = require('../middleware/profilePictureUpload');

const utils = require('../utils');
const { isValidEmail } = require('../utils/email');
const { authCookieName } = require('../app-config');

const bsonToJson = (data) => { return JSON.parse(JSON.stringify(data)) };
const removePassword = (data) => {
    const { password, __v, ...userData } = data;
    return userData
}

function register(req, res) {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { tel, username, password, repeatPassword } = body;
    const email = String(body.email || '').trim().toLowerCase();
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();

    if (!email || username === undefined || username === '' || password === undefined || password === '') {
        return res.status(400).json({ message: 'Email, username, and password are required.' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({
            message: 'Please enter a valid email address (must include @ and a domain with a dot, e.g. name@example.com).',
        });
    }

    if (!firstName || !lastName) {
        return res.status(400).json({ message: 'First name and last name are required.' });
    }

    if (password !== repeatPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    return userModel.create({ firstName, lastName, tel, email, username, password })
        .then((doc) => {
            try {
                const o = doc.toObject({ versionKey: false });
                // Corte explícito del secreto: lo que se envía al cliente nunca incluye `password`.
                const { password: _passwordDrop, __v, ...rest } = o;
                const safe = {
                    _id: String(rest._id),
                    firstName: rest.firstName,
                    lastName: rest.lastName,
                    email: rest.email,
                    username: rest.username,
                    tel: rest.tel,
                    themes: Array.isArray(rest.themes) ? rest.themes : [],
                    posts: Array.isArray(rest.posts) ? rest.posts : [],
                    created_at: rest.created_at,
                    updatedAt: rest.updatedAt,
                };

                const token = utils.jwt.createToken({ id: safe._id });
                if (process.env.NODE_ENV === 'production') {
                    res.cookie(authCookieName, token, { httpOnly: true, sameSite: 'none', secure: true });
                } else {
                    res.cookie(authCookieName, token, { httpOnly: true });
                }
                return res.status(200).json(safe);
            } catch (inner) {
                console.error('[register] response build failed:', inner);
                return res.status(500).json({
                    message: inner instanceof Error ? inner.message : 'Could not finish registration.',
                });
            }
        })
        .catch((err) => {
            const dup = err.code === 11000 || err.code === '11000';
            if (dup) {
                const key = err.keyValue ? Object.keys(err.keyValue)[0] : 'value';
                return res.status(409).json({ message: `This ${key} is already registered!` });
            }
            if (err.name === 'ValidationError') {
                const first = Object.values(err.errors || {})[0];
                const msg = first?.message || 'Invalid registration data.';
                return res.status(400).json({ message: String(msg) });
            }
            if (err.name === 'CastError') {
                return res.status(400).json({ message: err.message || 'Invalid data format.' });
            }
            if (
                err.name === 'MongoServerSelectionError' ||
                err.name === 'MongooseServerSelectionError'
            ) {
                return res.status(503).json({ message: 'Database unavailable. Is MongoDB running?' });
            }
            console.error('[register]', err.name, err.code, err.message);
            const payload = {
                message: err.message || 'Registration failed.',
            };
            if (process.env.NODE_ENV !== 'production') {
                payload.name = err.name;
                payload.code = err.code;
            }
            return res.status(500).json(payload);
        });
}

function login(req, res, next) {
    const email = String(req.body?.email || '').trim();
    const password = req.body?.password;

    if (!email || password === undefined || password === '') {
        return res.status(401).send({ message: 'Wrong email or password' });
    }

    const emailRegex = new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    userModel.findOne({ email: emailRegex })
        .then(user => {
            return Promise.all([user, user ? user.matchPassword(password) : false]);
        })
        .then(([user, match]) => {
            if (!match) {
                res.status(401)
                    .send({ message: 'Wrong email or password' });
                return
            }
            user = bsonToJson(user);
            user = removePassword(user);

            const token = utils.jwt.createToken({ id: user._id });

            if (process.env.NODE_ENV === 'production') {
                res.cookie(authCookieName, token, { httpOnly: true, sameSite: 'none', secure: true })
            } else {
                res.cookie(authCookieName, token, { httpOnly: true })
            }
            res.status(200)
                .send(user);
        })
        .catch(next);
}

function logout(req, res) {
    const token = req.cookies[authCookieName];

    tokenBlacklistModel.create({ token })
        .then(() => {
            res.clearCookie(authCookieName)
                .status(204)
                .send({ message: 'Logged out!' });
        })
        .catch(err => res.send(err));
}

function getProfileInfo(req, res, next) {
    if (!req.user || !req.isLogged) {
        return res.status(200).json(null);
    }
    const { _id: userId } = req.user;

    userModel.findOne({ _id: userId }, { password: 0, __v: 0 }) //finding by Id and returning without password and __v
        .then(user => { res.status(200).json(user) })
        .catch(next);
}

function editProfileInfo(req, res, next) {
    const { _id: userId } = req.user;
    const { tel, username, email } = req.body;

    userModel.findOneAndUpdate({ _id: userId }, { tel, username, email }, { runValidators: true, new: true })
        .then(x => { res.status(200).json(x) })
        .catch(next);
}

function uploadProfilePicture(req, res, next) {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded. Use the form field name "photo".' });
    }

    const userId = req.user._id;
    const publicPath = `/uploads/profiles/${req.file.filename}`;

    userModel.findById(userId)
        .then((user) => {
            if (!user) {
                return Promise.reject(Object.assign(new Error('User not found'), { status: 404 }));
            }
            const oldUrl = user.profilePictureUrl;
            return userModel.findOneAndUpdate(
                { _id: userId },
                { $set: { profilePictureUrl: publicPath } },
                { new: true },
            ).then((updated) => ({ oldUrl, updated }));
        })
        .then(({ oldUrl }) => {
            if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith('/uploads/profiles/')) {
                const basename = path.basename(oldUrl);
                const fullPath = path.join(profileUploadsDir, basename);
                fs.unlink(fullPath, () => { });
            }
            return userModel.findOne({ _id: userId }, { password: 0, __v: 0 });
        })
        .then((doc) => {
            res.status(200).json(doc);
        })
        .catch(next);
}

module.exports = {
    login,
    register,
    logout,
    getProfileInfo,
    editProfileInfo,
    uploadProfilePicture,
}
