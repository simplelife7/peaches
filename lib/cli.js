var fs = require('fs');
var path = require('path');
var cssbeautify = require('cssbeautify');
var Peaches = require('./peaches');
var concat = require('./concat');
var logger = require('nlogger').logger('cli');

/**
 * 读取打包配置
 * 读取package.json文件,位于脚本执行的目录下.
 * 关于package.json的详细说明: docs/package.json.md;
 * @return {Object} package
 */
function loadConfig() {
    "use strict";
    var config;
    try {
        config = fs.readFileSync('./package.json');
    } catch (e) {
        logger.error('无法读取package.json，系统退出！');
        process.exit(1);
    }
    try {
        config = JSON.parse(config);
    } catch (ex) {
        logger.error('package.json 定义似乎有问题,检查一下!');
        process.exit(1);
    }
    return config;
}

function main() {
    "use strict";
    var config = loadConfig();
    concat(config.output, function (err, styles) {
        var dist, spriteName, peaches, styleText;
        logger.info('开始处理背景图片合并');

        function makePeaches(dist, spriteName) {
            styleText = styles[dist];
            peaches = new Peaches(styleText, {
                name: 'nginx', 
                root: path.join(path.dirname(dist), '../images/'),//在命令执行的当前目录
                baseURI: '../'
            }, function (err, styleText, peaches) {
                fs.writeFile(dist, cssbeautify(styleText), function () {
                    logger.info('{}处理完毕', dist);
                    if (peaches.sprite) {
                        logger.warn('生成的图片为:{}, URL为:{}', peaches.sprite.name, peaches.sprite.url);
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

if (!module.parent) {
    main();
}