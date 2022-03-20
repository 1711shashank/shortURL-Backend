const { userDataBase, urlModel } = require('../models/mongoDB')
const {
  updateClicks,
  findSortLink,
  findAuthorizedUserLink,
  findLongUrl,
  updateCreatedCount,
  saveSortedUrl,
  saveSortedUrlForUnauthorizedUser
} = require('../services/user.servics')
const userRouter = require('./userRouter')
const jwt = require('jsonwebtoken')
const generator = require('../services/generator')
const JWT_KEY = 'skf453wdanj3rfj93nos'

module.exports.sortURL = async function sortURL (req, res) {
  try {
    var { longUrl } = req.body
    longUrl = generator.filterUrl(longUrl)

    console.log(req.user)

    if (req.user) {
      const isUrlAlreadyShorted = await findLongUrl(req, longUrl)
      console.log('UrlAlreadyShorted', isUrlAlreadyShorted)

      if (isUrlAlreadyShorted) {
        const updateUrlCreation = await updateCreatedCount(isUrlAlreadyShorted)

        console.log('urlCreatedCount ', updateUrlCreation)
        var { urlUsedCount, urlCreatedCount, sortUrl } = isUrlAlreadyShorted.urlData[0]

        res.status(200).json({
          message: 'URL',
          data: { longUrl,sortUrl, urlCreatedCount: urlCreatedCount + 1, urlUsedCount },
          statusCode: 200
        })
        return;
      } else {
        const sortUrl = generator.short();

        const result = await saveSortedUrl(req.user, longUrl, sortUrl);
        const { urlCreatedCount, urlUsedCount } = result;
        console.log('saved shortened url', result);

        res.status(200).json({
          message: 'URL',
          data: {longUrl,sortUrl,urlCreatedCount,urlUsedCount},
          statusCode: 200
        })
      }
    } else {
      const sortUrl = generator.short();
      const result = await saveSortedUrlForUnauthorizedUser(longUrl,sortUrl);
      console.log("result sortUrl: ", result)
      res.status(200).json({ data: { longUrl, sortUrl } });
    }
  } catch (err) {
    console.log('err in userController', err)
    res.status(500).json({
      message: 'Internal Server Error',
      statusCode: 500
    })
  }
}

exports.redirectUser = async (req, res) => {
  try {
    let key = req.params.shortId;
    let sortUrl= `http://localhost:3000/${key}`;
    // sortUrl = prefix.concate(sortUrl);
    console.log('short url', sortUrl)

    const result = await findAuthorizedUserLink(sortUrl)

    console.log('result url user', result)

    if (result) {
      const longUrl = result.urlData[0].longUrl
      console.log('long URL: ' + JSON.stringify(longUrl))

      await updateClicks(req, sortUrl, result)

      res.redirect(longUrl)
    } else {
      const result = await findSortLink(sortUrl)

      if (!result) {
        res.status(404).json({ message: 'Invalid short Id', statusCode: 404 })
        return
      }
      const longUrl = result.urlData[0].longUrl
      console.log('long URL: ' + JSON.stringify(longUrl))
      await updateClicks(req, sortUrl, result)
      res.redirect(longUrl)
      return
    }
  } catch (err) {
    console.log('error in redirect', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

module.exports.protectRoute = function protectRoute (req, res, next) {
  // checking wether user is logged In or not using cookies (JWT encrypted cookies)
  try {
    // if isVerified token is Invalide then it will give an error and to the catch block
    // and if it is true then isVerified will contain some payload value and pass the is statement
    // we can also skip the if() conduction and directly write the statement inside it

    // req.cookies.isLoggedIn this hashValue contain payload (_id), so while verifying [_id] is not required
    if (!req.headers['authorization']) {
      next();
    } else {
      let isVerified = jwt.verify(req.headers['authorization'] ,JWT_KEY);
      if (isVerified) {
        
        console.log("jwt ", isVerified.payload);
        req.user = isVerified.payload;

      }
      next()
    }
  } catch (err) {
    console.log('error', err)
    res.status(511).json({
      message: 'Please Login',
      statusCode: 511
    })
  }
}

module.exports.logoutUser = function logoutUser (req, res) {
  res.cookie('isLoggedIn', 'false', { maxAge: 1 })
  res.status(200).json({
    message: 'User LogOut Successfully'
  })
}

// stats
module.exports.getUserData = async function getUserData (req, res) {
  if (!req.user) {
    res.status(401).json({ message: 'User Not Authenticated', statusCode: 401 })
    return
  }

  let userData = await userDataBase.findOne({ _id: req.user });
  if (userData.role === 'admin') {
    let allData = await userDataBase.find({});
    userData = allData;
  }


  res.status(200).json({
    message: 'In the dashborad',
    res: userData,
    statusCode: 200
  })
}

module.exports.updateProfile = async function updateProfile (req, res) {
  try {
    let user_ID = jwt.verify(req.cookies.isLoggedIn, JWT_KEY).payload
    let userData = await userDataBase.findById(user_ID)

    let dataToBeUpdated = req.body

    const keys = []
    for (let key in dataToBeUpdated) {
      keys.push(key)
    }

    for (let i = 0; i < keys.length; i++) {
      userData[keys[i]] = dataToBeUpdated[keys[i]]
    }

    await userData.save() // update the data to mongoDB

    console.log('Data Updated successfully')
    res.status(200).json({
      message: 'Data Updated successfully',
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
