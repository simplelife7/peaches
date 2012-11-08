var path = require('path');
var download = require('./download');
var forEachAsync = require('forEachAsync');

function md5(str) {
    var hash = require('crypto').createHash('md5');
    return hash.update(str + "").digest('hex');
}
function ImageBucket(pom, peache, next) {
    this.next = next || function () {
    }
    this.options = {
        ignorePositionRegex:/left|right|center|bottom|em|%/i,

        onlineRegex:/^(https?|ftp):\/\//i
    }
    this.pom = pom;
    /**
     * {
     *     file:'',//文件在本地的绝对地址.
     *     extname:'png' //文件扩展名
     *     selectorTexts:[]'选择器',
     *     error:'xx' // 如果存在error,说明下载出错了.
     *     url:''//background-image url;
     * }
     * @type {Object}
     */
    this.images = {};
    this.peache = peache;
    this._init();
}
ImageBucket.prototype = {
    _init:function () {
        this.findImages();

    },
    /**
     * 找到所有需要sprite的图片.
     */
    findImages:function () {
        var self = this, url, position;
        this.pom.cssom.cssRules.forEach(function (cssRule) {
            url = cssRule.style.getPropertyValue('background-image');
            /**
             * 如果不存在url,直接返回
             */
            if (!url) {
                return;
            }
            /**
             * 如果不是指定的图片格式,返回
             */
            var match = url.match(self.peache.options.imageRegex);
            if (!match) {
                return;
            }
            /**
             * 如果position是忽略的类型,返回
             *
             */
            position = cssRule.style.getPropertyValue('background-position');
            if (position.match(self.peache.options.ignorePosition)) {
                return;
            }
            //更新position的值.
            var positions = position.split(/\s+/);
            if (!positions[0]) {
                positions[0] = '0';
            }
            if (!positions[1]) {
                positions[1] = '0';
            }

            var image = self.images[match[1]];
            if (image) {
                image.selectorTexts.push(cssRule.selectorText);
            }
            else {
                self.images[match[1]] = {
                    selectorTexts:[cssRule.selectorText],
                    extname:match[2],
                    url:match[1],
                    p:positions
                }
            }
        });
    },
    /**
     * 获取图片的绝对路径
     * 如果是网络地址,那么先下载保存到默认路径中.
     * 异步过程
     * TODO:避免重复下载
     */
    locatImageFile:function (callback) {
        var self = this, image_urls = [];
        for (var image_url in this.images) {
            image_urls.push(image_url);
        }
        forEachAsync(image_urls,function (next, image_url) {
            var image = self.images[image_url];
            var match, image_name;
            if (match = image_url.match(self.options.onlineRegex)) {
                // 如果图片url带有参数,那么指定一个随机的图片名称
                image_name = md5(image_url);
                image_name = path.join(self.peache.options.sprite.root, '/' + image_name + '.' + self.images[image_url].extname);

                //image_name 图片保存的完整路径
                download(image_url, image_name, function (err, file) {
                    if (err) {
                        image.error = err;
                    }
                    image.file = file;
                    next();
                });
            }
            //如果是本地地址,需要将相对地址转换成绝对地址
            else {
                image.file = path.join(self.peache.options.baseDir, image_url);
                next();
            }
        }).then(function () {
                callback();
            });
    }
}

module.exports = exports = ImageBucket;