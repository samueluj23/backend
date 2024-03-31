// "use strict";
const express = require("express");
const route = express.Router();
const homeRoute = require("../controller/home");
const userRoute = require("../controller/user/user");
//Home Route
route.get("/", homeRoute.home);

route.get("/get-stage", userRoute.getStageDetails);
route.post("/get-admin", userRoute.getAdminAddress);
route.post("/is-admin", userRoute.checkAdmin);
route.post("/update-presale", userRoute.updateStage);

route.use((req, res, next) => {
    res.status(401).send({ success: false, msg: "Route not found", data: {}, errors: '' });
});


module.exports = route;



