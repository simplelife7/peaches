'use strict';
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var upyun = require('upyun');
var logger = require('nlogger').logger('plugin/upyun');

function Server(name, config) {
    this.serverName = 'upyun';
    this.options = {
        //sprite图片前缀
        prefix: 'upyun',
        // 合并图片文件保存的目录
        root: __dirname,
        // 临时文件下载目录
        tmp: __dirname,
        // upyun  用户名
        username: '',
        // upyun 密码
        password: '',
        // 上传的bucket
        bucket: '',
        //访问图片的url
        baseURI: 'http://peaches.b0.upaiyun.com/'
    };
    this.options = _.extend(this.options, config);
    this.imageName = this.options.prefix + '-' + name + Date.now() + '.png';
    this.name = path.join(this.options.root, this.imageName);
    this.url = this.options.baseURI + this.imageName;
    this._init();
}
Server.prototype = {
    _init: function () {
        this.upyun = upyun(this.options.bucket, this.options.username, this.options.password);
    },
    write: function (canvas, next) {
        var buffer = canvas.toBuffer();
        this.upyun.uploadFile(this.imageName, buffer, function (err) {
            next(err);
        });
    }
};

module.exports = Server;