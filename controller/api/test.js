const express = require('express')
const router = express.Router()
const models = global.models;
const mongoose = require('mongoose');
const { apiAuth } = require('../../middleware/auth')
const { success, error401 } = require('../../function/response')
const { generateJwtToken } = require('../../function/common')
const config = require('../../config')

const bcrypt=require('bcrypt');
const { validationResult } = require("express-validator");
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
const session = require('express-session');
const adminLayout = 'test.ejs';
const loginLayout = 'signin.ejs';
const dashboardLayot = 'dashboard.ejs'
const profileLayot = 'profile.ejs'
const otpLayout = 'otpvalid.ejs'
const changepass = 'changepass.ejs'
var transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: "noreply199810@gmail.com",
      pass: "cgzoxksdyidloarh"
    }
});
let maxdate = new Date(new Date().setFullYear(new Date().getFullYear()-10)).toISOString().substr(0,10)


exports.test = async (req, res) => {
    try {
        // models.test.create({test: "amit new"}, ( data ) => {
        //     success(res, 'Create test collection', data)
        // }) 
        
        // models.test.fetchAll({}, ( err, data ) => {
        //     success(res, 'Create test collection', data)
        // }) 
        // console.log(models)
        success(res,'hello')
    } catch (e) {
        console.log(e)
    }

}

exports.web = async (req, res) => {
    try {
        let sendData = { layout : adminLayout};
    return res.render('test', sendData);
    } catch (e) {
        console.log(e)
    }

}

exports.register = async (req, res) => {
    try {
        let mongodb=await models.user.findOne({
            mail:req.body.mail
        })
        if(mongodb){
            return false;
        }
        else{
        let password=await bcrypt.hashSync(req.body.pass,10)
        let mongo=await models.user.create({
            name:req.body.name,
            pass:password,
            mail:req.body.mail
        })
        console.log(mongo)
        let sendData = { layout : loginLayout,data:""};
    return res.render('signin', sendData);
    }
    } catch (e) {
        console.log(e)
    }

}

exports.login = async (req, res) => {
    try {
        let mongo=await models.user.findOne({
            mail:req.body.mail
        })
        if (mongo) {
            let password=await bcrypt.compare(req.body.pass,mongo.pass)
            console.log(password)
            if(password){
                console.log("login successfully")
                if(mongo.valid && mongo.valid==true){
                    req.session.userid=mongo._id
                    res.redirect('/dashboard')    
                }
                else{
                    let otp=Math.floor(1000+Math.random()*9000)
                    mongo.otp=otp
                    mongo.otptime=new Date()
                    await mongo.save()
                    let mailoption={
                        from:"noreply199810@gmail.com",
                        to:mongo.mail,
                        subject:"AUTHENTICATION USING OTP",
                        text:`your otp is ${otp}`
                    }
                    transporter.sendMail(mailoption,function(e,i){
                        if(e){
                            console.log(e)
                        }
                        else{
                            console.log(i.response)
                            let endtime=new Date(new Date().getTime()+1*60000)
                            let otpvalid = { layout : otpLayout,email:mongo.mail,endtime:endtime};
                            res.render('otpvalid',otpvalid)
                        }
                    })
                }
                // let sendData = { layout : dashboardLayot};
                // return res.render('dashboard', sendData);
            }
            else{
                console.log("incorrect password or email")
                let sendData = { layout : loginLayout,data:"incorrect password or email"};
                return res.render('signin', sendData);
            }
        }
        else{
            console.log("incorrect password or email")
            let sendData = { layout : loginLayout,data:"incorrect password or email"};
            return res.render('signin', sendData);
        }
        // console.log(mongo)
    //     let sendData = { layout : loginLayout};
    // return res.render('signin', sendData);
    } catch (e) {
        console.log(e)
    }

}

exports.loginview = async (req, res) => {
    try {
        let sendData = { layout : loginLayout,data:""};
    return res.render('signin', sendData);
    } catch (e) {
        console.log(e)
    }

}
exports.dashboard = async (req, res) => {
    let userlist=await models.user.find({})
    console.log(userlist)
    let sendData = { layout : dashboardLayot,userlist : userlist};
    return res.render('dashboard', sendData);
}
exports.profile = async (req, res) => {
    let image;
    let user=await models.user.findOne({mail: req.user.mail})
    console.log(user)
    if(user.profilepicture){
        image=user.profilepicture
    }
    else{
        image="avatar.jpeg"
    }
    let sendData = { layout : profileLayot,mail : user.mail,name : user.name,profilepicture : image,phone : user.ph,birth : user.dob.toISOString().substr(0,10),maxdate : maxdate};
    return res.render('profile', sendData);
}
exports.imagechange = async (req, res) => {
    console.log(req.file)
    let user=await models.user.findOne({mail: req.user.mail})
    user.profilepicture=req.file.filename
    await user.save()
    console.log(user)
    let sendData = { layout : profileLayot,mail : user.mail,name : user.name,profilepicture : req.file.filename,phone : user.ph,birth : user.dob.toISOString().substr(0,10),maxdate : maxdate};
    return res.render('profile', sendData);
}
exports.logout = async (req, res,next) => {
    req.session.destroy(function (e){
        if(e){
            return next(e)
        }
        else{
            res.redirect("/login")
        }
    })
}
exports.otpvalid = async (req, res,next) => {
    try {
        let sendData = { layout : otpLayout};
    return res.render('otpvalid', sendData);
    } catch (e) {
        console.log(e)
    }
}
exports.validotp = async (req, res,next) => {
    try {
        let checkotp = await models.user.findOne({mail: req.body.email})
        if (checkotp.otp==req.body.otp && new Date()<=new Date(checkotp.otptime.getTime()+1*60000)) {
            checkotp.valid=true
            await checkotp.save()
            req.session.userid=checkotp._id
            res.redirect('/dashboard')           
        } else {
            let sendData = { layout : loginLayout,data:"incorrect OTP"};
            return res.render('signin', sendData);           
        }
    } catch (error) {
        console.log(error)
    }
}
exports.editprofile = async (req, res,next) => {
    let userdetails = await models.user.findOne({mail: req.body.mail})
    userdetails.name = req.body.username
    console.log(req.body.dob)
    userdetails.dob = new Date(req.body.dob)
    userdetails.ph = req.body.ph
    await userdetails.save()
    let sendData = { layout : profileLayot,mail : userdetails.mail,name : userdetails.name,profilepicture : userdetails.profilepicture,phone : userdetails.ph,birth : userdetails.dob.toISOString().substr(0,10),maxdate : maxdate};
    return res.render('profile', sendData);
}
exports.changepass = async (req, res) => {
    try {
        let sendData = { layout : changepass,confirmmsg:""};
    return res.render('changepass', sendData);
    } catch (e) {
        console.log(e)
    }

}
exports.changepassword = async (req, res) => {
    let mongo=await models.user.findOne({
        _id:req.session.userid
    })
    if (mongo) {
        let passwordmatch =await bcrypt.compare(req.body.curpass,mongo.pass)
        if(passwordmatch){
            if(req.body.newpass==req.body.conpass){
                mongo.pass=await bcrypt.hashSync(req.body.newpass,10)
                await mongo.save()
                let sendData = { layout : changepass,confirmmsg:"Password changed sucessfully"};
                return res.render('changepass', sendData);
            }
            else{
                let sendData = { layout : changepass,confirmmsg:"confirm password not matching with new password"};
                return res.render('changepass', sendData);
            }
        }
        else{
            let sendData = { layout : changepass,confirmmsg:"current password is not matching"};
            return res.render('changepass', sendData);
        }
}}
