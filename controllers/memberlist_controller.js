const db = require("../models/db.js");
const User = require("../models/UserModel.js");
const Attendance = require("../models/AttendanceModel.js");

const memberlist_controller = {
    deleteMember: function (req, res) {
        var phonenum = req.query.phonenum;
		
        db.deleteOne (User, {phonenum: phonenum}, (result) => {
            console.log("Delete One Member: " + result);
        });
        db.deleteMany (Attendance, {phonenum: phonenum}, (result) =>{
            console.log("Delete Many Member: " + result);
        });
        res.redirect("/loadMembers");
    },
};

module.exports = memberlist_controller;