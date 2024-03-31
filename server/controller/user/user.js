"use strict";
const valid = require('validator');
const transactionModel = require('../../model/transactionModel');
const stageModel = require('../../model/stageModel');
const Validator = require('../validationController');
const { sendToken } = require('../tokenTransfer')


async function varifyField(field) {
    if (typeof (field) == "string") {
        field = valid.trim(field);
    }

    if (field != null && field != undefined && field != '') {
        return true
    } else {
        return false
    }
}

exports.saveTransaction = async (req, res) => {
    try {
        let data = Validator.checkValidation(req.body);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        let walletAddress = data.walletAddress.trim();
        let stakeToken = data.stakeToken.trim();
        let txHash = data.txHash.trim();
        let solAmount = data.solAmount.trim();

        if (!varifyField(walletAddress)) {
            return res.status(203).send({ success: false, msg: "walletAddress is required", data: {}, errors: "" });
        } else if (!varifyField(stakeToken)) {
            return res.status(203).send({ success: false, msg: "stakeToken is required", data: {}, errors: '' });
        } else if (!varifyField(solAmount)) {
            return res.status(203).send({ success: false, msg: "solAmount is required", data: {}, errors: '' });
        } else if (!varifyField(txHash)) {
            return res.status(203).send({ success: false, msg: "txHash is required", data: {}, errors: '' });
        } else {
            const NoOfRecords = await transactionModel.find({ txHash }).countDocuments();
            if (NoOfRecords == 0) {
                const NewUser = new transactionModel({
                    walletAddress,
                    stakeToken,
                    txHash,
                    solAmount
                })
                NewUser.save(NewUser).then(async (saved) => {
                    if (saved) {
                        await sendToken(walletAddress, stakeToken, txHash)
                        await stageModel.findOneAndUpdate({ status: true }, { $inc: { raisedSol: solAmount } })
                        return res.status(200).send({ success: true, msg: "Saved successfully", data: '', errors: '' });
                    } else {
                        return res.status(203).send({ success: false, msg: "Error while processing your request ! please try again later", data: {}, errors: '' })
                    }
                })
            } else {
                return res.status(203).send({ success: false, msg: "txHash already exists", data: {}, errors: '' });
            }
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ success: false, msg: err.message, data: {}, errors: err });
    }
}

exports.getOneUserDetails = async (req, res) => {
    try {
        const walletAddress = req.body.walletAddress.trim();
        if (walletAddress !== undefined && walletAddress !== null && walletAddress !== "") {
            const isUserExist = await transactionModel.find({ walletAddress });
            if (isUserExist.length) {
                const aggregationPipeline = [
                    {
                        $match: {
                            walletAddress: walletAddress,
                        },
                    },
                    {
                        $group: {
                            _id: "$walletAddress",
                            totalStakeToken: { $sum: { $toDouble: "$stakeToken" } },
                        },
                    },
                ];
                const userAggregation = await transactionModel.aggregate(aggregationPipeline);

                if (userAggregation.length) {
                    const tokenBalance = userAggregation[0].totalStakeToken;
                    return res.status(200).send({
                        success: true,
                        msg: "Data fetched",
                        data: { tokenBalance, walletAddress },
                        err: "",
                    });
                } else {
                    return res.status(201).send({ success: true, msg: "No transaction made by you", data: { tokenBalance: 0 }, errors: '' });
                }
            } else {
                return res.status(201).send({ success: true, msg: "No transaction made by you", data: { tokenBalance: 0 }, errors: '' });
            }
        } else {
            return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).send({ success: false, msg: error.message, data: {}, errors: "" });
    }
}

exports.getStageDetails = async (req, res) => {
    try {
        const isUserExist = await stageModel.find().select('-walletAddress');
        if (isUserExist.length) {
            return res.status(200).send({
                success: true,
                msg: "Data fetched",
                data: isUserExist[0],
                err: "",
            });
        } else {
            return res.status(201).send({ success: false, msg: "User not exists", data: {}, errors: '' });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).send({ success: false, msg: error.message, data: {}, errors: "" });
    }
}

exports.checkAdmin = async (req, res) => {
    try {
        const walletAddress = req.body.walletAddress.trim();
        if (walletAddress !== undefined && walletAddress !== null && walletAddress !== "") {
            const isUserExist = await stageModel.find();
            if (isUserExist.length) {
                let isAdmin = isUserExist[0].walletAddress.toLowerCase() === walletAddress.toLowerCase();
                if (isAdmin) {
                    return res.status(200).send({ success: true, msg: "This is admin", data: false, errors: '' });
                } else {
                    return res.status(200).send({ success: false, msg: "This is not admin", data: false, errors: '' });
                }

            } else {
                return res.status(201).send({ success: false, msg: "User not exists", data: {}, errors: '' });
            }
        } else {
            return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).send({ success: false, msg: error.message, data: {}, errors: "" });
    }
}

exports.updateStage = async (req, res) => {
    try {
        let data = Validator.checkValidation(req.body);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        if (data.walletAddress !== undefined && data.walletAddress !== null && data.walletAddress !== "") {

            let walletAddress = data.walletAddress;

            const isUserExist = await stageModel.findOne({ walletAddress });

            if (!isUserExist) {
                return res.status(203).send({ success: false, msg: "You are not admin", data: "", err: "" })
            }

            let tokenPrice = 0; let launchPrice = 0; let raisedSol = 0; let totalSol = 0; let adminPubKey = "";
            let endDate = 0;

            if (data.adminPubKey != undefined) {
                adminPubKey = data.adminPubKey
            }
            if (data.tokenPrice != undefined) {
                tokenPrice = data.tokenPrice
            }
            if (data.launchPrice != undefined) {
                launchPrice = data.launchPrice;
            }
            if (data.raisedSol != undefined) {
                raisedSol = data.raisedSol;
            }
            if (data.totalSol != undefined) {
                totalSol = data.totalSol
            }

            if (data.endDate != undefined) {
                endDate = data.endDate
            }
            const currentStage = await stageModel.find();
            if (currentStage.length > 0) {
                stageModel.find({ _id: currentStage[0]._id }).then((stageData) => {
                    if (stageData) {
                        if (adminPubKey == null) {
                            adminPubKey = stageData[0].adminPubKey
                        }
                        if (tokenPrice == null) {
                            tokenPrice = stageData[0].tokenPrice
                        }
                        if (launchPrice == null) {
                            launchPrice = stageData[0].launchPrice
                        }
                        if (raisedSol == null) {
                            raisedSol = stageData[0].raisedSol
                        }
                        if (totalSol == null) {
                            totalSol = stageData[0].totalSol
                        }
                        if (endDate == null) {
                            endDate = stageData[0].endDate
                        }
                        const updateObj = { adminPubKey, tokenPrice, launchPrice, raisedSol, totalSol, endDate };
                        console.log("going for updated", updateObj)
                        stageModel.findOneAndUpdate({ _id: currentStage[0]._id }, updateObj).then((stageUpdate) => {
                            console.log("stageUpdate", stageUpdate)
                            if (stageUpdate) {
                                return res.status(200).send({ success: true, msg: "Status updated successfully", data: "", err: "" })
                            } else {
                                return res.status(203).send({ success: false, msg: "There is some error while processing your request", data: "", err: "" })
                            }
                        })
                    } else {
                        res.status(203).send({ success: false, msg: "Stage is not found", data: '', errors: '' });
                    }
                })
            } else {
                return res.status(203).send({ success: false, msg: "No data found", data: "", err: "" })
            }
        } else {
            return res.status(203).send({ success: false, msg: "Wallet Address is required", data: "", err: "" })
        }
    } catch (err) {
        console.log("err", err.message);
        return res.status(500).send({
            message: err.message || "Error while processing your request please try again later"
        });
    }
}

exports.getAdminAddress = async (req, res) => {
    try {
        const isUserExist = await stageModel.findOne({ status: true });
        if (isUserExist) {
            return res.status(200).send({
                success: true,
                msg: "Admin address fetched successfully",
                data: isUserExist.adminPubKey,
                err: "",
            });
        } else {
            return res.status(201).send({ success: false, msg: "User not exists", data: {}, errors: '' });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).send({ success: false, msg: error.message, data: {}, errors: "" });
    }
}


