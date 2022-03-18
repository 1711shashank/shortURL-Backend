const express = require("express");
const { cookie } = require("express/lib/response");
const authRouter = express.Router();

const { createAccount, loginUser } = require('./authController');

authRouter
    .route('/signup')
    .post(createAccount);
authRouter
    .route('/login')
    .post(loginUser);

module.exports = authRouter;
