const api = require('express').Router();
const apiauth = require('express').Router();
const { apiAuth } = require('../middleware/auth');
const { registerCheck, loginCheck, postCheck } = require('../middleware/validation');
// const { check } = require("express-validator");
//controllers
const multer= require('multer')
const path = require('path')




const testCont = require('../controller/api/test');
const { models } = require('mongoose');
const { response } = require('express');

// const token =req.headers['x-auth-token'];

module.exports = (app) => {
    app.use('/', api);
    app.use('/', apiauth);

    api.get('/', (req,res) => {
        res.send('Welcome!')
    })
    const storage = multer.diskStorage({
        destination: 'public/images',
         filename: function (req, file, cb) {
        console.log(file)
         const imgName = Date.now()+file.originalname;
         cb(null, imgName );
         },
        });
    const upload=multer({
        storage:storage,
        limit:{fileSize:"1000000"}
    })

    apiauth.use(async(req,res,next)=>{
        if(req.session && req.session.userid){
            let user=await models.user.findOne({_id : req.session.userid})
            if(!user){
                res.status(403)
                res.locals.message="unable to find user"
                res.redirect("/login")
            }
            else{
                req.user=user
                next()
            }
        }
        else{
            res.redirect("/login")
        }
    })
    api.get('/test', testCont.test);
    api.get('/web', function(req,res,next){
        if(req.session && req.session.userid){
            res.redirect("/dashboard")
        }
        else{
            next();
        }
    },testCont.web);
    api.post('/register', testCont.register);
    api.get('/login', function(req,res,next){
        if(req.session && req.session.userid){
            res.redirect("/dashboard")
        }
        else{
            next();
        }
    },testCont.loginview);
    api.post('/login', testCont.login);
    apiauth.get('/dashboard', testCont.dashboard);
    apiauth.get('/profile', testCont.profile);
    apiauth.post('/imagechange',upload.single("file"), testCont.imagechange);
    apiauth.get('/logout',testCont.logout);
    api.get('/otpvalid',testCont.otpvalid);
    api.post('/validotp',testCont.validotp);
    api.post('/editprofile',testCont.editprofile)
    apiauth.get('/changepass',testCont.changepass)
    apiauth.post('/changepassword',testCont.changepassword)
}