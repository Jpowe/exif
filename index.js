var express = require('express')
var app = express()
var R = require('ramda')
var request = require('request').defaults({ encoding: null });
var scrapyard = require("scrapyard");
var ExifImage = require('exif').ExifImage;

// INPUT:  PATH TO IMAGES
var urlPath = 'http://s3.amazonaws.com/waldo-recruiting/'
// OUTPUT:  array of key/value
var exifKV = []

app.get('/', function (req, res) {
  res.send('Length of key/value array, exifKV =  '+exifKV.length)
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

var scraper2 = new scrapyard({
    cache: './storage',
    debug: true,
    timeout: 300000,
    retries: 5,
    connections: 10
});

scraper2({
    url: urlPath,
    type: 'xml',
    encoding: 'utf8'
}, function(err, xml) {
    if (err) return console.error(err);
    var imageNames = R.pluck("Key",R.path(['ListBucketResult','Contents'],xml))
    // TODO:  SPAWN PROCESS
    imageNames.forEach(f => getFile(urlPath+f))
});

var getFile =function(file){
   request.get(file, function (err, res, body) {
      //process exif here
      try {
        new ExifImage({ image : body }, function (error, exifData) {
        if (error)
            console.log('Error: '+error.message);
        else
            //console.log(exifData);
            var kv = [{fileName:file}, exifData]
            exifKV.push(kv)
            console.log('arr '+JSON.stringify(kv))
        });
      } catch (error) {
        console.log('Error: ' + error.message);
      }
    });
}
