'use strict';
var fs = require('fs');
var forEachAsync = require('forEachAsync');

var logger = require('nlogger').logger('concat');

function concat(output, next) {
    var dist, dists = [], list, styleText, i,
        styles = {};
    for (dist in output) {
        if (output.hasOwnProperty(dist)) {
            dists.push(dist);
        }
    }
    forEachAsync(dists,function (callback, dist) {
        logger.info('开始合并:{}', dist);
        list = output[dist];
        styleText = '';
        for (i = 0; i < list.length; i++) {
            try {
                styleText += '\n';
                styleText += fs.readFileSync(list[i]);
            }
            catch (e) {
                logger.error('读取文件：{}发生错误，Error:{}', list[i], e);
                logger.error('程序自动退出！');
                process.exit(1);
            }
        }

        //fs.writeFileSync(dist, out.join('\n'));
        styles[dist] = styleText;
        logger.info('合并结束:{}', dist);
        callback();
    }).then(function () {
            logger.info('全部CSS文件合并结束');
            next(null, styles);
        });
}
module.exports = concat;