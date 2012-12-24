var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var logger = require('colorful').logging;
var md5 = require('../tools').md5;
var spawn = require('child_process').spawn;
function Server(name, config) {
    'use strict';
    this.serverName = 'scp';
    // 目前只支持 ssh-copy-id 之后的机器，没法使用用户名密码登录服务器。
    this.options = {
        username: '',
        // upyun 密码
        password: '',
        // 上传的bucket
        bucket: '',
        // 上传的服务器
        server: 'admin@assets.jf.alipay.net',
        // 上传到指定目录
        dir: "/home/admin/wwwroot/assets/membercenter/",
        //访问图片的url
        baseURI: 'http://assets.jf.alipay.net/membercenter/'
    };
    var Local = require('./local');
    this.local = new Local(name, config);
    this.options = _.extend(this.options, this.local.options);
    this.token = 'os;u]8Ls4q8w4xsa2yfXBPhFXEEyYyrBNE7kTcGjBEY8deWrv';
    this._init();
}
Server.prototype = {
    _init: function () {
        'use strict';
        logger.warn('正在使用scp上传图片到：%s 请确保可以无密码登录，可以google搜索：ssh-copy-id', this.options.server);
    },
    write: function (canvas, next) {
        'use strict';
        var self = this, scp;

        this.local.write(canvas, function (err, file) {
            if (err) {
                logger.error('发送错误：%s', err);
            }
            var name = md5(file) + path.extname(file);
            scp = spawn('scp', [file, self.options.server + ':' + self.options.dir + '/' + name]);
            scp.stdout.on('data', function (data) {
                logger.info('正在上传图片..');
            });

            scp.stderr.on('data', function (data) {
                logger.info('正在上传图片..');
            });

            scp.on('exit', function (code) {
                self.url = self.options.baseURI + name;
                logger.info('生成图片：%s',self.url);
                next();
            });
        });
    }
};

module.exports = Server;