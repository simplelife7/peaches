var fs = require('fs');
var path = require('path');
var peaches = require('./peaches');
var concat = require('./concat');
var async = require('async');
var logger = require('colorful').logging;
function main(config) {
    "use strict";
    try {
        var canvas = require('canvas');
    }
    catch (e) {
        logger.warn('无法加载canvas，使用在线模式');
    }

    concat(config.output, function (err, styles) {
        var spriteName, styleText, dirname;

        function makePeaches(dist, spriteName, callback) {
            logger.start('正在处理', dist);
            styleText = styles[dist];
            peaches(styleText, config, function (err, styleText) {

                dirname = path.dirname(dist);
                if (!fs.existsSync(dirname)) {
                    fs.mkdirSync(dirname);
                }
                fs.writeFile(dist, styleText, function (err) {
                    if (err) {
                        logger.error('%s处理错误;Error:%s', dist, err);
                    }
                    logger.debug('写入样式：', dist);
                    logger.end('处理结束');
                    callback();
                });

            }, spriteName);
        }

        logger.start('开始主进程');
        var dists = [];
        for (var dist in styles) {
            if (styles.hasOwnProperty(dist)) {
                dists.push(dist);
            }
        }
        async.forEachSeries(dists, function (dist, callback) {
            spriteName = path.basename(dist).replace('.css', '');
            makePeaches(dist, spriteName, callback);
        }, function () {
            logger.end('全部完成');
        });
    });
}

exports.main = main;

if (!module.parent) {
    main();
}