const db = require("../models/db.js");
const User = require("../models/UserModel.js");
const Attendance = require("../models/AttendanceModel.js");

const attendance_controller = {
    addAttendance: function(req, res) {
        db.findOne(User, { phonenum: req.query.phonenum }, null, (data) => {
            day = new Date();
            today = new Date(day.getFullYear(), day.getMonth(), day.getDate(), +8, 0, 0);
            var query ={
                phonenum: req.query.phonenum,
                session: req.query.session,
                firstname: data.firstname,
                lastname: data.lastname,
                baptism: data.baptism,
                date: today,
                logtime: day
            };
            console.log(query);
            db.insertOne(Attendance, query, (data) => {
                console.log(data)
            });
        });
    },

    deleteAttendance: function(req, res) {
        // yyyy-mm-dd
        var dateArr = req.query.date.split('-');
        var year = dateArr[0];
        var month = dateArr[1] - 1;
        var day = dateArr[2];
        var date = new Date(year, month, day, +8, 0, 0);
        console.log(date.toISOString());
        db.deleteOne(Attendance, {date: date, session: req.query.session, phonenum: req.query.phonenum}, (result) =>{
            console.log("RESULT: ", result);
            var url = "/sessionAttendance?date=" + req.query.date + "&session=" + req.query.session;
            res.redirect(url);
        });
    },
	
    submitAttendance: function(req, res) {
        var data = req.query.data;
        var day = new Date();
        var today = new Date(day.getFullYear(), day.getMonth(), day.getDate(), +8, 0, 0);

        for(var i = 0; i < data.length; i++) {
            delete data[i].checked;

            data[i].session = req.query.session;
            data[i].date = today;
            data[i].logtime = day;
        }
        
		db.insertMany(Attendance, data, (result) => {
            res.send(result);
        });
    },

    generateAttendence: function(req, res) {
        var start_date = new Date(req.query.start_date);        
        //var start_date = req.query.start_date;\
        console.log(req.query.start_date);
        db.findMany(Attendance, {date: start_date, session: req.query.q_ses}, null, (data) => {
            console.log(data);
            res.send(data);
        });
    },
};

module.exports = attendance_controller;
