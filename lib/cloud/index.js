var request = require('request');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var url = require('url');
var md5 = require('../tools').md5;
var logger = require('colorful').logging;


function Cloud(styleText, config, peaches, next) {
    'use strict';
    this.options = {
        'server': 'http://cloud.imagetea.com'
    };
    if(process.env.NODE_ENV === 'development'){
        this.options.server = 'http://cloud.peaches.net';
    }

    this.options = _.extend(this.options, config);
    this.styleText = styleText;
    this.peaches = peaches;
    this.next = next || function () {
    };
    this._init();
}
Cloud.prototype = {
    _init: function () {
        'use strict';
        this.send();
    },
    send: function () {
        'use strict';
        var self = this;
        logger.start('正在上传服务器');
        logger.log('服务处理中...');
        request.post(url.format(this.options.server), {
                form: {
                    styleText: this.styleText,
                    spriteName: md5(process.env.USER + self.peaches.spriteName)
                }
            }, function (err, rsp, body) {
                logger.end('服务器处理结束');
                try {
                    body = JSON.parse(body);
                }
                catch (e) {
                    logger.error('服务器处理错误！');
                    logger.error('请联系 旺旺 @蔡伦 ，email: liuqin.sheng@alipay.com');
                    process.exit(1);
                }
                self.next(err, body);
            }
        );
    }
};

module.exports = Cloud;