var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var upyun = require('upyun');
var logger = require('colorful').logging;
var md5 = require('../tools').md5;
function Server(name, config) {
    'use strict';
    this.serverName = 'upyun';
    this.options = {
        username: '',
        // upyun 密码
        password: '',
        // 上传的bucket
        bucket: '',
        //访问图片的url
        baseURI: 'http://peaches.b0.upaiyun.com/'
    };
    var Local = require('./local');
    this.local = new Local(name, config);
    this.options = _.extend(this.options, this.local.options);
    this.token = 'VthzsGLDFhkRxXhmRhazFsNtyXymyFFBjEHeEyzBMQvYEtypFz';
    this._init();
}
Server.prototype = {
    _init: function () {
        'use strict';
        this.upyun = upyun(this.options.bucket, this.options.username, this.options.password);
    },
    write: function (canvas, next) {
        'use strict';
        var self = this;

        this.local.write(canvas, function (err, file) {
            if (err) {
                logger.error('发送错误：{}', err);
            }
            var buffer = fs.readFileSync(file);
            var name = md5(buffer.toString()) + '.png';
            self.upyun.uploadFile(name, buffer, function (err) {
                logger.info('生成图片：{}', self.options.baseURI + name);
                next(err);
            });
        });
    }
};

module.exports = Server;