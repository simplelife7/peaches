var fs = require('fs');
var logger = require('colorful').logging;
var url = require('url');
function download_file_wget(file_url, file_name, next) {
    'use strict';
    var exec = require('child_process').exec;
    var wget = 'wget -O ' + file_name + ' ' + file_url;
    exec(wget, function (err, stdout, stderr) {
        if (err) {
            if (err) {
                logger.error('无法下载:%s,程序自动退出!', file_url);
                logger.error(err);
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
//module.exports = download_file_wget;
/**
 * 下载文件到指定目录
 * @param uri 需要下载的文件的文件
 * @param file_name 保存文件到指定目录（需要含文件名）;
 * @param next  function(err,file_name){};
 */
function download(uri, file_name, next) {
    'use strict';
    var connect, options = url.parse(uri);
    try {
        connect = require(options.protocol.slice(0, -1));
    }
    catch (e) {
        logger.error('只能下载 http 及 https 的文件');
        return next(new Error('只能下载 http 及 https 的文件'));
    }

    connect.get(options,function (res) {
        if (res.statusCode !== 200) {
            logger.error('Error: No data received from ' + uri);
            return next(new Error('Error: No data received'));
        }
        var file = fs.createWriteStream(file_name);
        res.on('data', function (chunk) {
            file.write(chunk);
        });
        res.on('end', function () {
            file.end(function (err) {
                next(null, file_name);
            });
        });
    }).on('error', function (err) {
            return next(err);
        });
}

module.exports = download;