const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isValidEmail } = require('../utils/email');
const saltRounds = Number(process.env.SALTROUNDS) || 5;

const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    tel: {
        type: String,
    },
    profilePictureUrl: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (v) => isValidEmail(v),
            message: () => 'Please enter a valid email address (e.g. name@example.com).',
        },
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: [3, 'Username should be at least 3 characters'],
        validate: {
            validator: function (v) {
                return typeof v === 'string' && /^[a-zA-Z]+$/.test(v);
            },
            message: () => 'Username must be letters only (A–Z), at least 3 characters, no numbers.',
        },
    },
    password: {
        type: String,
        required: true,
        minlength: [5, 'Password should be at least 5 characters'],
        validate: {
            validator: function (v) {
                if (typeof v !== 'string') {
                    return false;
                }
                return /[a-zA-Z]/.test(v) && /[0-9]/.test(v);
            },
            message: () => 'Password must contain at least one letter and one number.',
        },
    },
    themes: [{
        type: ObjectId,
        ref: "Theme"
    }],
    posts: [{
        type: ObjectId,
        ref: "Post"
    }]
}, { timestamps: { createdAt: 'created_at' } });

userSchema.methods = {
    matchPassword: function (password) {
        return bcrypt.compare(password, this.password);
    }
}

userSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) {
                next(err);
            }
            bcrypt.hash(this.password, salt, (err, hash) => {
                if (err) {
                    next(err);
                }
                this.password = hash;
                next();
            })
        })
        return;
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
