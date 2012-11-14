'use strict';
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var logger = require('nlogger').logger('download');
function download_file_wget(file_url, file_name, next) {
    var wget = 'wget -O ' + file_name + ' ' + file_url;
    exec(wget, function (err, stdout, stderr) {
        if (err) {
            if (err) {
                logger.error('无法下载:{},程序自动退出!', file_url);
                process.exit(1);
            }
        }
        else {
            next(null, file_name);
        }
    });
}
module.exports = download_file_wget;