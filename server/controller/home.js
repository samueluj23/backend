"use strict";
exports.home = (req, res) => {
    res.status(200).send({ success: true, msg: "Api is working!", data: "", err: "" })
}