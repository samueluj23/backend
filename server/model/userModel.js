"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
    },
    totalStakeToken: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: () => { return new Date() }
    }
})

const User = mongoose.model('user', schema);

module.exports = User;