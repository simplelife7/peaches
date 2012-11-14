'use strict';
var path = require('path');
var fs = require('fs');

var _ = require('underscore');


var POM = require('./pom');
var ImageBucket = require('./ImageBucket');
var Combine = require('./Combine');
var logger = require('nlogger').logger('peaches.js');

/**
 * Peaches 主函数, 通过给Peaches传递样式,和服务配置,生成编译好后的样式文件.
 * 注意: Peaches本身不处理样式文件的读取(所以不支持传入一个样式文件的地址),
 * 写入(所以不支持直接将生成的样式,输出为一个样式文件)
 * @param styleText 出入的样式文件字符串.
 * @param spriteConfig 图片文件访问配置
 * @param next(err, styleText, peaches)  如果没有错误,err为null, styleText为编译好后的样式.
 * @param spriteName
 * @constructor
 */
function Peaches(styleText, spriteConfig, next, spriteName) {
    this.styleText = styleText;
    this.next = next;
    //spriteName 为可选参数.
    //建议设置一个spriteName, 这样每次都生成一个确定的图片地址.
    this.spriteName = spriteName || Date.now();
    this.options = {
        /**
         * 样式表存在位置的默认路径
         * process.pwd() 当前工作路径
         */
        ignorePosition: /%|in|cm|mm|em|ex|pt|pc|center|center|top|bottom/i,
        imageRegex: /\(['"]?([^\s]+\.(png|jpg|jpeg)(\?.*?)?)['"]?\)/i,
        /**
         * sprite图片的保存和访问服务
         * 作为一个插件存在,默认使用nginx
         */
        server: {
            //使用本地服务器
            name: 'nginx',
            //图片文件保存的目录
            root: path.join(process.cwd(), '/images/'),
            //访问url
            baseURI: 'http://static.peaches.net/peaches/'
        }
    };
    this.options.server = _.extend(this.options.server, spriteConfig);
    this._init();
}
Peaches.prototype = {
    _init: function () {
        var self = this;
        if (!fs.existsSync(this.options.server.root)) {
            try {
                fs.mkdirSync(this.options.server.root);
            }
            catch (e) {
                logger.error('无法创建目录:{},程序自动退出!', this.options.server.root);
                process.exit(1);
            }
        }
        this.pom = new POM(this.styleText);
        //this.server = require('./staticServer').createServer(this.options.staticPort, this.options.staticConfig)
        //下载为异步进行,需要等所有图片下载完成,才能combo
        this.imageBucket = new ImageBucket(this.pom, this);
        this.imageBucket.downloadImageFile(function () {
            self.combo = new Combine(self.imageBucket, self, function () {
                self.next(null, self.pom.styleSheet.toString(), self);
            });
        });
    }
};

module.exports = Peaches;