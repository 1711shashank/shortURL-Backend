const { userDataBase, urlModel } = require('../models/mongoDB')
const userRouter = require('./userRouter')
const jwt = require('jsonwebtoken')
const { is } = require('express/lib/request')
const generator = require('../services/generator')
const JWT_KEY = 'skf453wdanj3rfj93nos'

module.exports.sortURL = async function sortURL (req, res) {
  try {
    const { longUrl } = req.body
    const sortUrl = generator.short()
    console.log(req.user)

    if (req.user) {
      const isUrlAlreadyShorted = await userDataBase.findOne({
        _id: req.user,
        'urlData.longUrl': longUrl
      })
      console.log('UrlAlreadyShorted', isUrlAlreadyShorted)

      if (isUrlAlreadyShorted) {
        const sortedUrl = isUrlAlreadyShorted.urlData[0].sortUrl
        var { urlUsedCount, urlCreatedCount } = isUrlAlreadyShorted.urlData[0]
        urlCreatedCount = urlCreatedCount + 1
        const updateCreatedCount = await userDataBase.updateOne(
          { _id: req.user, 'urlData.longUrl': longUrl },
          {
            $set: { 'urlData.$.urlCreatedCount': urlCreatedCount }
          }
        )
        console.log('urlCreatedCount ', updateCreatedCount)

        res.status(200).json({
          message: 'URL',
          data: { sortedUrl, urlCreatedCount, urlUsedCount },
          statusCode: 200
        })
        return
      } else {
        const urlStats = {
          longUrl,
          sortUrl,
          urlCreatedCount: 1,
          urlUsedCount: 1
        }

        const result = await userDataBase.updateOne(
          { _id: req.user },
          {
            $push: { urlData: urlStats }
          },
          { upsert: true }
        )
        console.log('result', result)

        res.status(200).json({
          message: 'URL',
          data: sortUrl,
          statusCode: 200
        })
      }
    } else {
      const urlStats = {
        longUrl,
        sortUrl,
        urlCreatedCount: 1,
        urlUsedCount: 1
      }
      const urlobj = new urlModel({ urlData: urlStats })
      const result = await urlobj.save()
      console.log('result', result)

      res.send(result)
    }
  } catch (err) {
    console.log('err in userController', err)
    res.status(500).json({
      message: 'Internal Server Error',
      statusCode: 500
    })
  }
}

module.exports.protectRoute = function protectRoute (req, res, next) {
  // checking wether user is logged In or not using cookies (JWT encrypted cookies)
  try {
    // if isVerified token is Invalide then it will give an error and to the catch block
    // and if it is true then isVerified will contain some payload value and pass the is statement
    // we can also skip the if() conduction and directly write the statement inside it

    // req.cookies.isLoggedIn this hashValue contain payload (_id), so while verifying [_id] is not required
    if (!req.cookies.isLoggedIn) {
      next()
    } else {
      let isVerified = jwt.verify(req.cookies.isLoggedIn, JWT_KEY)
      if (isVerified) {
        req.user = isVerified.payload
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
  let dataObj = jwt.verify(req.cookies.isLoggedIn, JWT_KEY)

  let userData = await userDataBase.findOne({ _id: dataObj.payload })

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

exports.redirectUser = async (req, res) => {
  try {
    const sortUrl = req.params.shortId
    console.log('short url', sortUrl)

    if (req.user) {
      const result = await userDataBase.findOne(
        {
          _id: req.user,
          'urlData.sortUrl': sortUrl
        },
        { "urlData.$": 1 }
      )

      console.log('result url user', result)
      if (result) {
        const longUrl = result.urlData[0].longUrl
        console.log('long URL: ' + JSON.stringify(longUrl))
        var { urlUsedCount } = result.urlData[0]
        urlUsedCount++

        const updateClicks = await userDataBase.updateOne(
          {
            _id: req.user,
            'urlData.sortUrl': sortUrl
          },
          { $set: { 'urlData.$.urlUsedCount': urlUsedCount } }
        )

        res.redirect(longUrl)
      } else {
        res
          .status(404)
          .json({ message: 'Something Went Wrong', statusCode: 404 })
        return
      }
    } else {
      const result = await urlModel.findOne(
        { 'urlData.sortUrl': sortUrl },
        { 'urlData.$': 1 }
      )
      console.log('short Url result', result)
      if (result) {
        var { urlUsedCount } = result.urlData[0];
        urlUsedCount++
        console.log("urlUsedCount", urlUsedCount);

        const updateClicks = await urlModel.updateOne(
          {
            'urlData.sortUrl': sortUrl
          },
          { $set: { 'urlData.$.urlUsedCount': urlUsedCount } }
        );
        console.log("updateClicks", updateClicks);

        res
          .writeHead(301, {
            Location: `${result.urlData[0].longUrl}`
          })
          .end()
      } else {
        res.json({ statusCode: 404, message: 'Url not found' })
      }
    }
  } catch (err) {
    console.log('error in redirect', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
