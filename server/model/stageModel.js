"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
    },
    adminPubKey: {
        type: String,
        required: true,
    },
    tokenPrice: {
        type: Number,
        required: true,
    },
    launchPrice: {
        type: Number,
        required: true,
    },
    raisedSol: {
        type: Number,
        required: true,
    },
    totalSol: {
        type: Number,
        required: true,
    },
    status:{
        type: Boolean,
        default:true,
    },
    endDate: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: () => { return new Date() }
    }
})

const stageModel = mongoose.model('stage', schema);

module.exports = stageModel;