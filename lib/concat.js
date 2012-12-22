'use strict';
var fs = require('fs');
var async = require('async');
var logger = require('colorful').logging;

function concat(output, next) {
    var dist, dists = [], list, styleText, i,
        styles = {};
    for (dist in output) {
        if (output.hasOwnProperty(dist)) {
            dists.push(dist);
        }
    }
    async.forEachSeries(dists, function (dist, callback) {
        var list = output[dist], styleText = '', file;
        logger.start('开始合并:', dist);
        for (i = 0; i < list.length; i++) {
            file = list[i];
            logger.debug('合并文件：%s', file);
            try {
                styleText += '\n';
                styleText += fs.readFileSync(file);
            }
            catch (e) {
                logger.error('读取文件：%s，发生错误，Error:%s', list[i], e);
                logger.error('程序自动退出！');
                process.exit(1);
            }
        }
        //fs.writeFileSync(dist, out.join('\n'));
        styles[dist] = styleText;
        logger.end('合并结束');
        callback();
    }, function () {
        next(null, styles);
    });
}
module.exports = concat;