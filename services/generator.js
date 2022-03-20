exports.short = () => {
  var length = 6;
  var result = ''
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  const prefix = 'http://localhost:3000/';
  const url = prefix.concat(result);
  console.log("short url", url);
  return url;
}

exports.filterUrl = (url) => {
  var getDomain = url.split(':');
  if (getDomain[0] === 'http' || getDomain[0] === 'https') {
    return url;
  }
  else {
    var prefix = 'http://'
    var result = prefix.concat(url);
    console.log("prefix", result);
    return result;
  }

}
