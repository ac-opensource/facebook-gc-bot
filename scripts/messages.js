const path = require('path');
const fs = require('fs');
const _ = require('lodash')
const directoryPath = path.resolve(process.cwd(), 'messages');

function customizer(objValue, srcValue) {
  if (_.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

fs.readdir(directoryPath, function (err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }

  let finalMerged = {}
  files.forEach(function (file) {
    if (path.extname(file) === '.json') {
      let rawdata = fs.readFileSync( path.resolve(directoryPath, file) )
      finalMerged = _.mergeWith(finalMerged, JSON.parse(rawdata),customizer)
    }
  });
  fs.writeFileSync('messages.json', JSON.stringify(finalMerged, null, 4));
});
