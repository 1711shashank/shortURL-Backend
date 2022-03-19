const { userDataBase } = require('../models/mongoDB');
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { use } = require('./authRouter');
const { cookie } = require('express/lib/response');
const JWT_KEY = 'skf453wdanj3rfj93nos';

module.exports.createAccount = async function createAccount(req, res) {
    try {
        let dataObj = req.body;

        let oldUser = await userDataBase.findOne({ email: dataObj.email });
        if (oldUser) {
            res.status(409).json({
                message: "User Already exist with this email ID",
                statusCode: 409
            });
        } else {
            let user = await userDataBase.create(dataObj);
            let obj = {
                email: dataObj.email,
                password: dataObj.password
            }
            res.status(200).json({
                message: "Account created Successfully",
                statusCode: 200,
                data: user
            });
        }
    }
    catch (err) {
        res.status(500).json({
            message: err.message,
            statusCode: 500
        });

    }
}

module.exports.loginUser = async function loginUser(req, res) {
    try {
        let dataObj = req.body;
        res.cookie('isLoggedIn', 'false');
        if (dataObj.email && dataObj.password) {
            let user = await userDataBase.findOne({ email: dataObj.email });
            if (user) {
                let isVaildPassword = user.password === dataObj.password;
                console.log(isVaildPassword);
                if (isVaildPassword) {
                    let uid = user['_id'];
                    let jwtSign = jwt.sign({ payload: uid }, JWT_KEY);
                    res.cookie('isLoggedIn', jwtSign);

                    obj = {
                        email : dataObj.email
                    }
                    console.log("You Have LoggedIn");

                    res.status(200).json({
                        message: "LogIn Successfully",
                        statusCode : 200,
                        data: {user,token:jwtSign}
                        
                    });
                }
                else {
                    res.status(401).json({
                        message: "Invalid Password",
                        statusCode : 401
                    });
                }
            } else {
                res.status(403).json({
                    message: "User does not exist",
                    statusCode : 403
                });
            }
        }
        else {
            return res.status(400).json({
                message: 'Wrong credantials',
                statusCode : 400
            })
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message:err.message,
            statusCode : 500
        })
    }
}
