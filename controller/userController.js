const userDataBase = require('../models/mongoDB');
const userRouter = require('./userRouter');

module.exports.sortURL = async function sortURL(req, res) {
    try {
        let link = req.body;
        console.log(link);

        // tempObj = {
        //     name:"123",
        //     email:"123@gmail.com",
        //     password:"123",
        //     urlData : []
        // }
        // await userDataBase.create(tempObj);


        let user = await userDataBase.findOne({ _id: "623407fac9a2f40bc15c9a23" });

        if (user) {
            urlData = user.urlData;
            urlStats = {
                longUrl: link.url,
                sortUrl: link.url,
                urlCreatedCount: "1",
                urlUsedCount: "1"
            }

            urlData.push(urlStats);
            // await user.save();
        }

        res.status(200).json({
            message: "URL",
            data: user,
            statusCode: 200
        })

    } catch (err) {
        res.status(500).json({
            message: err.message,
            statusCode: 500
        })
    }


}















module.exports.protectRoute = function protectRoute(req, res, next) {
    // checking wether user is logged In or not using cookies (JWT encrypted cookies)
    try {

        // if isVerified token is Invalide then it will give an error and to the catch block 
        // and if it is true then isVerified will contain some payload value and pass the is statement 
        // we can also skip the if() conduction and directly write the statement inside it

        // req.cookies.isLoggedIn this hashValue contain payload (_id), so while verifying [_id] is not required
        let isVerified = jwt.verify(req.cookies.isLoggedIn, JWT_KEY);
        if (isVerified) {
            next();
        }
    }
    catch {
        res.status(511).json({
            message: 'Please Login',
            statusCode: 511
        })
    }
}

module.exports.logoutUser = function logoutUser(req, res) {

    res.cookie('isLoggedIn', 'false', { maxAge: 1 });
    res.status(200).json({
        message: "User LogOut Successfully",
    })
}







// stats
module.exports.getUserData = async function getUserData(req, res) {

    let dataObj = jwt.verify(req.cookies.isLoggedIn, JWT_KEY);

    let userData = await userDataBase.findOne({ _id: dataObj.payload });

    res.status(200).json({
        message: "In the dashborad",
        res: userData,
        statusCode: 200
    })
}



module.exports.updateProfile = async function updateProfile(req, res) {

    try {
        let user_ID = jwt.verify(req.cookies.isLoggedIn, JWT_KEY).payload;
        let userData = await userDataBase.findById(user_ID);

        let dataToBeUpdated = req.body;

        const keys = [];
        for (let key in dataToBeUpdated) {
            keys.push(key);
        }

        for (let i = 0; i < keys.length; i++) {
            userData[keys[i]] = dataToBeUpdated[keys[i]];
        }

        await userData.save();         // update the data to mongoDB

        console.log("Data Updated successfully");
        res.status(200).json({
            message: "Data Updated successfully",
            data: userData,
            statusCode: 200
        })

    } catch (err) {
        res.status(500).json({
            message: err.message,
            statusCode: 500
        })
    }
}

