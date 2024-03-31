"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
    },
    solAmount:{
        type: String,
        required: true,
    },
    stakeToken: {
        type: String,
        required: true,
    },
    txHash: {
        type: String,
        required: true,
    },
    status:{
        type: Boolean,
        default:false
    },
    tokenTxHash:{
        type: String,
    },
    date: {
        type: Date,
        default: () => { return new Date() }
    }
})

const transaction = mongoose.model('transaction', schema);

module.exports = transaction;