var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var logger = require('colorful').logging;
var url = require('url');
function download_file_wget(file_url, file_name, next) {
    'use strict';
    var wget = 'wget -O ' + file_name + ' ' + file_url;
    exec(wget, function (err, stdout, stderr) {
        if (err) {
            if (err) {
                logger.error('无法下载:{},程序自动退出!{}', file_url);
                if (err.toString().indexOf('wget') > 0) {
                    logger.error('没有安装wget，请安装：brew install wget');
                }
                process.exit(1);
            }
        }
        else {
            next(null, file_name);
        }
    });
}
module.exports = download_file_wget;