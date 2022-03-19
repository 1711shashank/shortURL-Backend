const { userDataBase, urlModel } = require('../models/mongoDB')

exports.updateClicks = async (req, sortUrl, data) => {
    try {
        const param={'urlData.sortUrl':sortUrl};
        if (req.user) {
          param = {...param,_id:req.user}
        }
       
    var { urlUsedCount } = data.urlData[0]
    urlUsedCount++

    const result = await userDataBase.updateOne(
      
        param,
    
      { $set: { 'urlData.$.urlUsedCount': urlUsedCount } }
    )
    return result
  } catch (err) {
    console.log('error in updatin clicks', err)
    throw err
  }
}

exports.findAuthorizedUserLink = async (sortUrl) => {
  try {
    const result = await userDataBase.findOne(
      {
        'urlData.sortUrl': sortUrl
      },
      { 'urlData.$': 1 }
    )
    return result
  } catch (err) {
    console.log('error in finding user', err)
    throw err
  }
}

exports.findSortLink = async sortUrl => {
  try {
      const result = await urlModel.findOne(
          {
              'urlData.sortUrl': sortUrl
          },
          { 'urlData.$': 1 }
      );

    return result
  } catch (err) {
    console.log('error in finding short link', err)
    throw err
  }
}

exports.findLongUrl = async (req, longUrl) => {
  try {
    const result = await userDataBase.findOne(
      {
        _id: req.user,
        'urlData.longUrl': longUrl
      },
      { 'urlData.$': 1 }
    )
    return result
  } catch (err) {
    console.log('error in finding Long Url', err)
    throw err
  }
}

exports.updateCreatedCount = async (userObj) => {
  try {
    var id = userObj._id;
    var { urlCreatedCount, longUrl } = userObj.urlData[0];
    urlCreatedCount = urlCreatedCount + 1;
    const result = await userDataBase.updateOne(
      { _id: id, 'urlData.longUrl': longUrl },
      {
        $set: { 'urlData.$.urlCreatedCount': urlCreatedCount }
      }
    )
    return result
  } catch (err) {
    console.log('error in updating Url', err)
    throw err
  }
}

exports.saveSortedUrl = async (id,longUrl, sortUrl) => {
  try {
    const urlStats = {
      longUrl,
      sortUrl,
      urlCreatedCount: 0,
      urlUsedCount: 0
    }

    const result = await userDataBase.updateOne(
      { _id: id },
      {
        $push: { urlData: urlStats }
      },
      { upsert: true }
    )
      return result;
  } catch (err) {
    console.log('error in finding Long Url', err)
    throw err
  }
}

exports.saveSortedUrlForUnauthorizedUser = async (longUrl,sortUrl) => {
    try {
        const urlStats = {
  longUrl,
  sortUrl,
  urlCreatedCount: 1,
  urlUsedCount: 1
}
const urlobj = new urlModel({ urlData: urlStats })
const result = await urlobj.save()
console.log('result', result)
        return result;
    }
    catch (err) {
        
    }
}