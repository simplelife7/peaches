'use strict';
var fs = require('fs');
var forEachAsync = require('forEachAsync');

var logger = require('nlogger').logger('concat');

function concat(output, next) {
    var dist, dists = [], list, out,
        styles = {};
    for (dist in output) {
        if (output.hasOwnProperty(dist)) {
            dists.push(dist);
        }
    }
    forEachAsync(dists,function (callback, dist) {
        logger.info('开始合并:{}', dist);
        list = output[dist];
        out = list.map(function (file) {
            return fs.readFileSync(file);
        });
        //fs.writeFileSync(dist, out.join('\n'));
        styles[dist] = out.join('\n');
        logger.info('合并结束:{}', dist);

        callback();
    }).then(function () {
            logger.info('全部CSS文件合并结束');
            next(null, styles);
        });
}
module.exports = concat;