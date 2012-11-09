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
function findPackage() {
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
    var config = findPackage();
    concat(config.output, function (err, styles) {
        var dist, spriteName, peaches;
        logger.info('开始处理背景图片合并');

        function makePeaches(styleText) {
            peaches = new Peaches(styleText, {
                name:   'nginx',
                //在命令执行的当前目录
                root:   path.join(path.dirname(dist), '../images/'),
                baseURI: '../'
            }, function (err, peaches) {
                fs.writeFile(dist, cssbeautify(peaches.pom.styleSheet.toString()), function () {
                    logger.info('{}处理完毕', dist);
                    logger.warn('生成的图片为:{}, URL为:{}', peaches.sprite.name, peaches.sprite.url);
                });
            }, spriteName);
        }

        for (dist in styles) {
            if (styles.hasOwnProperty(dist)) {
                spriteName = path.basename(dist).replace('.css', '');
                makePeaches(styles[dist]);
            }
        }
    });
}

if (!module.parent) {
    main();
}