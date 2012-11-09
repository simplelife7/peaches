var fs = require('fs');
var path = require('path')
var cssbeautify = require('cssbeautify');
var Peaches = require('./peaches');
var concat = require('./concat');
var logger = require('nlogger').logger('cli');

function findPackage() {
    try {
        var package = fs.readFileSync('./package.json');
    }
    catch (e) {
        logger.error('无法读取package.json，系统退出！')
        process.exit(1);
    }
    try {
        package = JSON.parse(package);
    }
    catch (e) {
        logger.error('package.json 定义似乎有问题,检查一下!');
        process.exit(1);
    }
    return package;
}

function main() {
    var package = findPackage();
    concat(package.output, function (err, styles) {
        logger.info('开始处理背景图片合并');
        for (var dist in styles) {

            new Peaches(styles[dist], {
                name:'nginx',
                //在命令执行的当前目录
                root:path.join(path.dirname(dist), '../images/'),
                baseURI:'../'
            }, function (err, peaches) {

                fs.writeFile(dist, cssbeautify(peaches.pom.styleSheet.toString()), function () {
                    logger.info('{}处理完毕', dist);
                    logger.warn('生成的图片为:{}, URL为:{}', peaches.sprite.name, peaches.sprite.url)
                });
            }, path.basename(dist).replace('.css', ''));
        }
    });
}

if (!module.parent) {
    main()
}