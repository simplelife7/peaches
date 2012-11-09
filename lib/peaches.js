var path = require('path');
var fs = require('fs');

var _ = require('underscore');


var POM = require('./pom');
var ImageBucket = require('./ImageBucket');
var Combine = require('./Combine');
var logger = require('nlogger').logger('peaches.js');

function Peaches(styleText, config, next/*,spriteName*/) {
    this.spriteName = arguments[3] || Date.now();
    this.styleText = styleText;
    this.next = next || function () {
    };
    this.options = {
        /**
         * 样式表存在位置的默认路径
         * process.pwd() 当前工作路径
         */
        ignorePosition:/%|in|cm|mm|em|ex|pt|pc|center|center|top|bottom/i,
        imageRegex:/\(['"]?(.+\.(png|jpg|jpeg)(\?.*?)?)['"]?\)/i,
        /**
         * sprite图片的保存和访问服务
         * 作为一个插件存在,默认使用nginx
         */
        sprite:{
            //使用本地服务器
            name:'nginx',
            //图片文件保存的目录
            root:path.join(process.cwd(), '/images/'),
            //访问url
            baseURI:'http://static.peaches.net/peaches/'
        }
    }
    this.options.sprite = _.extend(this.options.sprite, config);
    this._init();
}
Peaches.prototype = {
    _init:function () {
        var self = this;
        if (!fs.existsSync(this.options.sprite.root)) {
            try {
                fs.mkdirSync(this.options.sprite.root);
            }
            catch (e) {
                logger.error('无法创建目录:{},程序自动退出!', this.options.sprite.root);
                process.exit(1);
            }
        }
        this.pom = new POM(this.styleText);
        //this.server = require('./staticServer').createServer(this.options.staticPort, this.options.staticConfig)
        //下载为异步进行,需要等所有图片下载完成,才能combo
        this.imageBucket = new ImageBucket(this.pom, this)
        this.imageBucket.locatImageFile(function () {
            self.combo = new Combine(self.imageBucket, self);
            self.next(null, self);
        });
    }
}

module.exports = exports = Peaches;

if (!module.parent) {
    var fs = require('fs'), path = require('path');
    var peaches = new Peaches('/Users/liuqin/Projects/63.node/peaches/apps/core/test/style.css');
}