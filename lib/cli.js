var fs = require('fs');
var path = require('path');
var cssbeautify = require('cssbeautify');
var Peaches = require('./peaches');
var concat = require('./concat');
var logger = require('nlogger').logger('cli');

function main(config) {
    "use strict";
    concat(config.output, function (err, styles) {
        var dist, spriteName, peaches, styleText;
        logger.info('开始处理背景图片合并');

        function makePeaches(dist, spriteName) {
            styleText = styles[dist];
            peaches = new Peaches(styleText, config.server, function (err, styleText, peaches) {
                fs.writeFile(dist, cssbeautify(styleText), function () {
                    logger.info('{}处理完毕', dist);
                    if (peaches.server) {
                        logger.warn('生成的图片为:{}, URL为:{}', peaches.server.name, peaches.server.url);
                    }
                });
            }, spriteName);
        }

        for (dist in styles) {
            if (styles.hasOwnProperty(dist)) {
                spriteName = path.basename(dist).replace('.css', '');
                makePeaches(dist, spriteName);
            }
        }
    });
}

exports.main = main;

if (!module.parent) {
    main();
}