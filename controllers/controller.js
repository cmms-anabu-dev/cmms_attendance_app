const db = require("../models/db.js");
const User = require("../models/UserModel.js");
const Attendance = require("../models/AttendanceModel.js");
const Session = require('../models/SessionModel.js');
const Admin = require('../models/AdminModel.js');
var phonenum = null;
var loggedin = false;

const controller = {
	//-----------------------Handlebars Routing----------------------------//
    redirectHP: (req, res) => {
        console.log(loggedin);
        console.log(phonenum);
        res.redirect("/getIndex");
    },
	
	getIndex: function (req, res) {
        res.render("login", { 
            title: "Login",
            customCSS: '<link rel="stylesheet" href="CSS/login.css">'
        });
    },

    loadLogin: (req, res) => {
        res.render("login", {
            title: "Login",
            customCSS: '<link rel="stylesheet" href="CSS/login.css">'
        });
    },

    loadRegisterChurchgoer: (req, res) => {
        if(loggedin == false && phonenum == null) {
            res.redirect("/login");
        } else {
            res.render("register_churchgoer", {
                title: "Register",
                customCSS: '<link rel="stylesheet" href="CSS/register.css">'
            });
        }
    },

    loadRegisterModerator: (req, res) => {
        if(loggedin == false && phonenum == null) {
            res.redirect("/login");
        } else {
            res.render("register_moderator", {
                title: "Register Moderator",
                customCSS: '<link rel="stylesheet" href="CSS/register.css">'
            });
        }
    },
	
    /**
     * Load Members
     * 
     * Get all users, regardless of baptism type
     * or all users, filtered to a baptism category
     * 
     * @param {req} request by the client
     * @param {res} response to the client
     */
	loadMembers: function (req, res) {
        if(loggedin == false && phonenum == null) {
            res.redirect("/login");
        } else {
            if (req.query.baptism == null){
                db.findMany(User, {}, null, (data) => {
                    const tempArray = [];
                    if (data.length !== 0){
                        data.forEach(doc => tempArray.push(doc.toObject()));
                    }
                    db.countDocuments(User, {}, (count) => {
                        res.render("admin_homepage", { data: tempArray, count});
                    });
                });
            }
            else{
                db.findMany(User, {baptism:req.query.baptism}, null, (data) => {
                    const tempArray = [];
                    if (data.length !== 0){
                        data.forEach(doc => tempArray.push(doc.toObject()));
                    }
                    db.countDocuments(User, {}, (count) => {
                        res.render("admin_homepage", { data: tempArray, count});
                    });
                    
                });
            }
        }
    },

    /**
     * Load Sessions
     * 
     * Load all sessions, regardless of session type
     * or all sessions, filtered to a session category
     * 
     * @param {req} request by the client
     * @param {res} response by the client 
     */
    loadSessions: (req, res) => {
        if(loggedin == false && phonenum == null) {
            res.redirect("/login");
        } else {
            if (req.query.session == null){
                db.findMany(Session, {}, {ymddate: { $dateToString: {date: "$date", format: "%Y-%m-%d" }}, session: "$session"}, (data) => {
                    const tempArray = [];
                    if (data.length !== 0){
						data.forEach(doc => tempArray.push(doc.toObject()));
                    }
					console.log(data);
					res.render("sessions_repo", {data: tempArray});
                });
            }
            else{
                db.findMany(Session, {session: req.query.session}, {_id: 0, ymddate: { $dateToString: {date: "$date", format: "%Y-%m-%d" }}, session: 1}, (data) => {
                    const tempArray = [];
                    if (data.length !== 0){
						data.forEach(doc => tempArray.push(doc.toObject()));
                    }
					console.log(data);
                    res.render("sessions_repo", {data: data});
                });
            }
        }
    },

    /**
     * Load Moderators
     * 
     * Loads all moderators
     * 
     * @param {req} request by the client
     * @param {res} response by the client
     */
    loadModerators: (req, res) => {
        if(loggedin == false && phonenum == null) {
            res.redirect("/login");
        } else {
            //console.log("Hello there");
            db.findMany(Admin, {}, null, (data) => {
                const tempArray = [];
                if (data.length !== 0){
                    data.forEach(doc => tempArray.push(doc.toObject()));
                }
                db.countDocuments(User, {}, (count) => {
                    //console.log(tempArray);
                    //console.log(count);
                    res.render("moderators_list", { data: tempArray, count});
                });
                
            });
        }
    },

    /**
     * Load Profile
     * 
     * Loads the profile of a single member, containing
     * their personal and baptismal information
     * 
     * @param {*} req 
     * @param {*} res 
     */
    loadProfile: (req, res) => {
        if(loggedin == false && phonenum == null) {
            res.redirect("/login");
        } else {
            var phonenum = req.query.phonenum;
            db.findOne(User, {phonenum: phonenum},
                {   _id: 0,
                    lastname: 1,
                    firstname: 1,
                    phonenum: 1,
                    ymdbirthdate: {$dateToString: {format: "%Y-%m-%d", date: "$birthdate" }},
                    address: 1,
                    gender: 1,
                    status: 1,
                    baptism: 1,
                    ymdbaptismdate: {$dateToString: {date: "$baptismdate", format: "%Y-%m-%d" }},
                    baptismlocation: 1}, (result) => {
                if (!result){
                    res.sendStatus(404);
                }
                else{
                    var profile = result.toObject();
                    var baptstatid;
                    var bapthidden;
                    var baptdisabled;
                    if (profile.baptism == "Unbaptized"){
                        baptstatid = "ub";
                        bapthidden = "hidden";
                        baptdisabled = "disabled";
                    }
                    else if (profile.baptism == "Infant Baptism"){
                        baptstatid = "ib";
                        bapthidden = "";
                        baptdisabled = "";
                    }
                    else if (profile.baptism == "Water Baptism"){
                        baptstatid = "wb";
                        bapthidden = "";
                        baptdisabled = "";
                    }
                    res.render("profile", {lastname: profile.lastname,
                                           firstname: profile.firstname,
                                           phonenum: profile.phonenum,
                                           birthdate: profile.ymdbirthdate,
                                           address: profile.address,
                                           gender: profile.gender,
                                           status: profile.status,
                                           baptism: profile.baptism,
                                           baptismdate: profile.ymdbaptismdate,
                                           baptismlocation: profile.baptismlocation,
                                           baptstatid:baptstatid,
                                           bapthidden:bapthidden,
                                           baptdisabled: baptdisabled});
                }
            });
        }
    },
	
	loadAdminHP: (req, res) =>{
        if(loggedin == false && phonenum == null) {
            res.redirect("/login");
        } else {
            res.render("admin_homepage", {
                title: "Admin Homepage"
            });
        }
    },
	
    getFavicon: function (req, res) {
        res.status(204);
    },
	
	loadAttendance: (req, res) =>{
        if(loggedin == false && phonenum == null) {
            res.redirect("/login");
        } else {
            db.findMany(User, {}, null, (data) => {
                const tempArray = [];
                if (data.length !== 0){
                    data.forEach(doc => tempArray.push(doc.toObject()));
                }
                 db.countDocuments(User, {}, (count) => {
                     res.render("attendance", { data: tempArray, count});
                });
            });
            
            // res.render("attendance", {
            //     title: "Attendance",
            //     customCSS: '<link rel="stylesheet" href="CSS/register.css">'
            // });
        }
    },

    loadUsers: (req, res) => {
        db.findMany(User, {}, null, (data) => {
            res.send(data);
        });
    },

    searchUsers: (req, res) => {
        if(req.query.q_list != '') {
            db.findMany(User, {$or: [{firstname: {$regex: req.query.q_list}},
                                     {lastname:  {$regex: req.query.q_list}},
                                     {firstname: {$regex: req.query.q_list.toLowerCase()}},
                                     {lastname:  {$regex: req.query.q_list.toLowerCase()}},
                                     {firstname: {$regex: req.query.q_list.toUpperCase()}},
                                     {lastname:  {$regex: req.query.q_list.toUpperCase()}}]}, null, (data) => {
                res.send(data);
            });
        } else {
            db.findMany(User, {}, null, (data) => {
                res.send(data);
            });
        }
    },

    /**
     * Load Session Attendance
     * 
     * Load a session's attendance, containing
     * the type of session, session date, and
     * list of attendees.
     * 
     * @param {*} request by the client
     * @param {*} response to the client 
     */
    loadSessionAttendance: (req, res) =>{
        if(loggedin && phonenum == null)
            res.redirect("/login");
        else {
            var tempDate = new Date(req.query.date);
            var m;
            var d;
            var y;
            var sDate;
            var dateString;
            var fMonth, fDay, fYear;

            const months = ["January","February","March",
                            "April","May","June",
                            "July","August","September",
                            "October","November","December"];
            var fullDateString;
            var spanDate;
            var spanSession;
            var nav;

            // [0] Set Date Properly to GMT+8
            m = tempDate.getMonth();
            d = tempDate.getDate();
            y = tempDate.getFullYear();
            sDate = new Date (y, m, d, +8, 0, 0);

            // [1] Seesion Date String
            fMonth = sDate.getMonth() + 1;
            if(fMonth < 10)
                fMonth = "0" + fMonth.toString();
            
            fDay = sDate.getDate();
            if(fDay < 10)
                fDay = "0" + fDay.toString();
            
            fYear = sDate.getFullYear();
            dateString = fYear + "-" + fMonth + "-" + fDay;

            // [2] Span Date String
            fullDateString = fYear + ", " + months[fMonth - 1] + " " + sDate.getDate();
            spanDate = "<span id=\"nav_date\">" + fullDateString + "</span>";
            spanSession = "<span id=\"nav_session\">" + req.query.session + "</span>";
            nav = "<p id=\"navigation\"><a href=\"/sessions\">All Sessions</a> / " + spanDate + " - " + spanSession + "</p>"
			
            // [3] Get the Data
            if(req.query.baptism === undefined) {
                db.findMany(Attendance, {date: sDate, session: req.query.session}, {}, (data) => {
                    const tempArr = [];
                    var tempData;
                    if(data) {
                        data.forEach((doc) => {
                            tempData = doc.toObject();
                            tempData['ymddate'] = dateString;
                            tempData['session'] = req.query.session;
                            tempArr.push(tempData);
                        });
                        console.log("Data For Each Null  done");
                    }
                    res.render("session", {navigation: nav, ymddate: dateString, session: req.query.session, data: tempArr});
                });
            } else {
                db.findMany(Attendance, {date: sDate, session: req.query.session, baptism: req.query.baptism}, {}, (data) => {
                    const tempArr = [];
                    var tempData;
                    if(data) {
                        data.forEach((doc) => {
                            tempData = doc.toObject();
                            tempData['ymddate'] = dateString;
                            tempData['session'] = req.query.session;
                            tempArr.push(tempData);
                        });
                        console.log("Data For Each Not Null  done");
                    }
                    res.render("session", {navigation: nav, ymddate: dateString, session: req.query.session, data: tempArr});
                });
            }
        }
    },

    /**
     * Stores the username used in the login for future use.
     */
    AllowLogin: function(req, res) {
        phonenum = req.query.phonenum;
        console.log(phonenum);
        loggedin = true;
        res.sendStatus(200);
    },

    /**
     * Resets values that indicate a user is logged in.
     */
    Logout: function(req, res){
        phonenum = null;
        loggedin = false;
        res.redirect('/');
    },
	
    /**
     * Searches for the phone number
     */
	searchPhone: function(req, res) {
        db.findOne(User, {phonenum: req.query.phonenum}, null, (data) => {
            res.send(data);
        });
    },

};

module.exports = controller;
