'use strict';
var fs = require('fs');
var path = require('path');
var download = require('./download');
var async = require('async');
var logger = require('colorful').logging;

var md5 = require('./tools').md5;
function ImageBucket(pom, peaches) {
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
    this.peaches = peaches;
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
            if (!cssRule.style) {
                return;
            }
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
            var match = url.match(self.peaches.options.imageRegex);
            if (!match) {
                return;
            }
            /**
             * 如果position是忽略的类型,返回
             *
             */
            position = cssRule.style.getPropertyValue('background-position');
            if (position.match(self.peaches.options.ignorePosition)) {
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
        async.forEach(image_urls, function (image_url, next) {
            var image = self.images[image_url], match, image_name;
            match = image_url.match(self.options.onlineRegex);
            if (match) {
                // 如果图片url带有参数,那么指定一个随机的图片名称
                image_name = md5(image_url);
                //image_name 图片保存的完整路径
                image_name = path.join(self.peaches.options.server.tmp, '/' + image_name + '.' + self.images[image_url].extname);
                if (fs.existsSync(image_name) && !self.peaches.options.clean) {
                    logger.debug('存在图片:%s，不再下载', image_url);
                    image.file = image_name;
                    next();
                }
                else {
                    logger.debug('下载图片：%s', image_url);
                    download(image_url, image_name, function (err, file) {
                        if (err) {
                            logger.warn('下载文件出现错误');
                            logger.error('请检测文件:%s 是否存在。程序退出！', image_url);
                            process.exit(1);
                        }
                        image.file = file;
                        next();
                    });
                }
            }
            //如果是本地地址,需要将相对地址转换成绝对地址
            else {
                image.file = path.join(self.peaches.options.baseDir, image_url);
                next();
            }
        }, function () {
            callback();
        });
    }
};

module.exports = ImageBucket;