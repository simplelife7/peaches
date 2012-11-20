'use strict';
var fs = require('fs');
var path = require('path');
var download = require('./download');
var forEachAsync = require('forEachAsync');
var logger = require('nlogger').logger('ImageBuck.js');

function md5(str) {
    var hash = require('crypto').createHash('md5');
    return hash.update(str.toString()).digest('hex');
}
function ImageBucket(pom, peache) {
    this.options = {
        ignorePositionRegex: /left|right|center|bottom|em|%/i,
        onlineRegex: /^(https?|ftp):\/\//i
    };
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
    _init: function () {
        this.findImages();
    },
    /**
     * 找到所有需要sprite的图片.
     */
    findImages: function () {
        var self = this, url, position, positions, image;
        this.pom.styleSheet.cssRules.forEach(function (cssRule) {
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
            positions = position.split(/\s+/);
            if (!positions[0]) {
                positions[0] = '0';
            }
            if (!positions[1]) {
                positions[1] = '0';
            }

            image = self.images[match[1]];
            if (image) {
                image.selectorTexts.push(cssRule.selectorText);
            }
            else {
                self.images[match[1]] = {
                    selectorTexts: [cssRule.selectorText],
                    extname: match[2],
                    url: match[1],
                    positions: positions
                };
            }
        });
    },
    /**
     * 获取图片的绝对路径
     * 如果是网络地址,那么先下载保存到默认路径中.
     * 异步过程
     */
    downloadImageFile: function (callback) {
        var self = this, image_urls = [], image_url;
        for (image_url in this.images) {
            if (this.images.hasOwnProperty(image_url)) {
                image_urls.push(image_url);
            }
        }
        forEachAsync(image_urls,function (next, image_url) {
            var image = self.images[image_url], match, image_name;
            match = image_url.match(self.options.onlineRegex);
            if (match) {
                // 如果图片url带有参数,那么指定一个随机的图片名称
                image_name = md5(image_url);
                //image_name 图片保存的完整路径
                image_name = path.join(self.peache.options.server.tmp, '/' + image_name + '.' + self.images[image_url].extname);
                if (fs.existsSync(image_name)) {
                    image.file = image_name;
                    next();
                }
                else {
                    download(image_url, image_name, function (err, file) {
                        if (err) {
                            image.error = err;
                        }
                        image.file = file;
                        next();
                    });
                }
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
};

module.exports = ImageBucket;