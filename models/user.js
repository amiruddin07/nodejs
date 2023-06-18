const mongoose = require('mongoose');

const user = mongoose.model('user', function () {
    var s = new mongoose.Schema({
        name: {
            type: String
        },
        pass: {
            type:String
        },
        mail: {
            type:String
        },
        profilepicture: {
            type:String
        },
        valid: {
            type:Boolean,
            default:false
        },
        otp: {
            type:Number
        },
        otptime: {
            type:Date
        },
        dob: {
            type:Date
        },
        ph: {
            type:String
        }

    }, {
        timestamps: true
    });

    return s
}());
global.models['user'] = user;