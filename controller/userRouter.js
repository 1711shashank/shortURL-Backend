const express = require("express");
const userRouter = express.Router();

const { sortURL, logoutUser, getUserData, updateProfile} = require('./userController');


userRouter
    .route('/sortURL')
    .post( sortURL );

userRouter
    .route('/dashboard')
    .get( getUserData);

userRouter
    .route('/updateProfile')
    .post( updateProfile);

userRouter
    .route('/logout')
    .get(logoutUser);

module.exports = userRouter;