var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

function download_file_wget(file_url, file_name, next) {
    var wget = 'wget -O ' + file_name + ' ' + file_url;
    exec(wget, function (err, stdout, stderr) {
        if (err) {
            throw err;
        }
        else {
            next(null, file_name);
        }
    });
}
module.exports = exports = download_file_wget;