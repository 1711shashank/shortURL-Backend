const express = require("express");
const userRouter = express.Router();

const { sortURL, logoutUser, getUserData, updateProfile,protectRoute, redirectUser} = require('./userController');


userRouter
    .route('/sortURL')
    .post(protectRoute, sortURL );

userRouter
    .route('/dashboard')
    .get( getUserData);

userRouter
    .route('/updateProfile')
    .post( updateProfile);

userRouter
    .route('/logout')
    .get(logoutUser);

userRouter.route('/:shortId')
            .get(protectRoute, redirectUser)

module.exports = userRouter;