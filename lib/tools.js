function md5(str) {
    'use strict';
    var hash = require('crypto').createHash('md5');
    return hash.update(str.toString()).digest('hex');
}
exports.md5 = md5;