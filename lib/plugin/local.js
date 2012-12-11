var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var logger = require('nlogger').logger('plugin/local');
var exec = require('child_process').exec;

function Server(name, config) {
    'use strict';
    var image;
    this.serverName = 'local';
    this.options = {
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
    image = this.options.prefix + '-' + name + '.png';
    this.name = path.join(this.options.root, image);
    this.url = this.options.baseURI + image;
    //token 用于处理url是异步获取的情况，先用token占位，等获取url后，替换
    this.token = 'vjFBvKEGAZdHyoadfUpRbVPwohtjGxRuRtUBaajVGXGXTqthnz';
}
Server.prototype = {
    write: function (canvas, next) {
        'use strict';

        var out = fs.createWriteStream(this.name), stream = canvas.createPNGStream();

        stream.on('data', function (chunk) {
            out.write(chunk);
        });

        stream.on('end', function () {
            next(null);
        });
    }
};

module.exports = Server;