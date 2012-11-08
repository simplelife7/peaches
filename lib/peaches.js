var _ = require('underscore');
var path = require('path');
var fs = require('fs');

var POM = require('./pom');
var ImageBucket = require('./ImageBucket');
var Combine = require('./Combine');

//TODO:cssFile似乎没有
function Peaches(cssFile, config, next, styleText) {
    this.styleText = styleText;
    this.next = next || function () {
    }
    this.options = {
        /**
         * 样式表存在位置的默认路径
         * process.pwd() 当前工作路径
         */
        baseDir:path.dirname(cssFile),
        baseImgDir:path.join(path.dirname(cssFile), '/peaches/'),
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
            root:'root',
            //访问url
            baseURI:'http://static.peaches.net/peaches/'
        }
    }
    this.cssFile = cssFile;
    this.options = _.extend(this.options, config);
    this.options.sprite = _.extend(this.options.sprite, config.sprite);
    this._init();
}
Peaches.prototype = {
    _init:function () {
        var self = this;
        if (!fs.existsSync(this.options.baseImgDir)) {
            try {
                fs.mkdirSync(this.options.baseImgDir);
            }
            catch (e) {
                this.error = 'Unable to create base image directory!';
                return;
            }
        }
        try {
            // 如果样式没有传递进来,那么使用cssFile 读取.
            if(typeof this.styleText == "undefined"){
                this.styleText = fs.readFileSync(this.cssFile).toString();
            }
        }
        catch (e) {
            this.error = 'Unable to read the css file!';
            return;
        }
        /*
         try{
         this.server = require('./plugin/' + this.options.static.name);
         }
         catch(e){
         this.server = require('./plugin/nginx');
         }*/

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
    console.log(peaches.pom.cssom.toString());
}