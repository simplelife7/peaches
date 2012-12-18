var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var logger = require('nlogger').logger('plugin/local');
var exec = require('child_process').exec;

function Server(name, config) {
    'use strict';
    var image, png8, png24;
    this.serverName = 'local';
    this.options = {
        format: 'png8',
        //png8后缀名
        png8ext: '-png8.png',
        png24ext: '.png',
        //sprite图片前缀
        prefix: 'sprite',
        //图片文件保存的目录
        root: __dirname,
        //图片将下载到这个目录
        tmp: __dirname,
        //访问图片的url
        baseURI: 'http://static.peaches.net/peaches/'
    };
    this.options = _.extend(this.options, config);
    png24 = this.options.prefix + '-' + name + this.options.png24ext;
    png8 = this.options.prefix + '-' + name + this.options.png8ext;
    this.name24 = path.join(this.options.root, png24);
    this.name = path.join(this.options.root, png8);
    logger.debug(this.name);
    logger.debug(typeof this.name)
    if (this.options.format === 'png24') {
        this.url = this.options.baseURI + png24;
    }
    else {
        this.url = this.options.baseURI + png8;
    }

    //token 用于处理url是异步获取的情况，先用token占位，等获取url后，替换
    this.token = 'vjFBvKEGAZdHyoadfUpRbVPwohtjGxRuRtUBaajVGXGXTqthnz';
}
Server.prototype = {
    write: function (canvas, next) {
        'use strict';
        var self = this;
        fs.writeFileSync(this.name24, canvas.toBuffer());
        // 但处理成png24时，不需要在做图片处理。
        if (this.options.format === 'png24') {
            next(null, this.name24);
        }
        else {
            self.png8(null, next);
        }
    },
    /**
     * png24 转化为 png8
     */
    png8: function (err, next) {
        'use strict';
        var pngquantLocal = path.join(__dirname, '../../bin/pngquant');
        var pngquant = 'pngquant';
        var command = ' -iebug -ext ' + this.options.png8ext + ' -force -speed 1  -- ' + this.name24;
        var self = this;
        // 使用系统命令行执行
        exec(pngquant + command,
            function (err, stdout, stderr) {
                if (err) {
                    // 尝试使用自带的命令行执行。
                    return exec(pngquantLocal + command,
                        function (err, stdout, stderr) {
                            if (err) {
                                logger.error('png 处理错误：{}', err);
                            }
                            next(err, self.name);
                        });
                }
                return next(null, self.name);
            });
    }
};

module.exports = Server;