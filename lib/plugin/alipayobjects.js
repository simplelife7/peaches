var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var upyun = require('upyun');
var logger = require('nlogger').logger('plugin/alipayobjects');
var request = require('request');
var url = require('url');

/**
 * 通用POST提交文件上传
 * @param name
 * @param config
 * @constructor
 */
function Server(name, config) {
    'use strict';
    this.serverName = 'alipayobjects';
    this.options = {
        username: 'liuqin.sheng',
        // 访问图片的url
        baseURI: 'https://i.alipayobjects.com/',
        // 上传图片的URL
        uploadUrl: ''
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
            var uploadUrl = url.parse(self.options.uploadUrl);
            uploadUrl.search = "?username=" + self.options.username + "&isImportance=0";
            var r = request.post(url.format(uploadUrl), function (err, rsp, body) {
                var result = JSON.parse(body);
                if (result.stat !== 'ok') {
                    logger.error('文件上传失败：{}', result);
                    return next(new Error('文件上传失败'));
                }
                var file = result.info[0];
                //uploadPath 会跟apimg目录，需要移除。
                self.url = file.uploadPath.replace('apimg/', '');
                self.url += file.newName;
                var baseUrl = url.parse(self.options.baseURI);
                baseUrl.pathname = path.join(baseUrl.pathname, self.url);
                self.url = url.format(baseUrl);
                next();
            });
            r.form().append('filedata', fs.createReadStream(file));
        });
    }
};

module.exports = Server;