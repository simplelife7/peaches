var fs = require('fs');
var path = require('path');
var peaches = require('./peaches');
var concat = require('./concat');
var logger = require('nlogger').logger('cli');

function main(config) {
    "use strict";
    concat(config.output, function (err, styles) {
        var dist, spriteName, styleText, dirname;
        logger.info('开始处理CSS');

        function makePeaches(dist, spriteName) {
            logger.info('正在处理：{}', dist);
            styleText = styles[dist];
            peaches(styleText, config, function (err, styleText, peaches) {
                dirname = path.dirname(dist);
                if (!fs.existsSync(dirname)) {
                    fs.mkdirSync(dirname);
                }
                fs.writeFile(dist, styleText, function (err) {
                    if (err) {
                        logger.error('{}处理错误;Error:{}', dist, err);
                    }
                    logger.info('{}处理完毕', dist);
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