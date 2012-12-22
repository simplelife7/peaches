var fs = require('fs');
var download = require('../lib/download');
var md5 = require('../lib/tools').md5;
module.exports = {
    setUp: function (callback) {
        'use strict';
        callback();
    },
    tearDown: function (callback) {
        'use strict';
        callback();
    },
    test1: function (test) {
        'use strict';
        var file_name = '/tmp/1ZXqZDls6m.jpg';
        download('https://i.alipayobjects.com/e/201211/1ZXqZDls6m.jpg', file_name, function (err, file_name) {

            test.equals(fs.existsSync(file_name), true);

            var file_md5 = md5(fs.readFileSync(file_name));
            test.equals(file_md5, 'd41d8cd98f00b204e9800998ecf8427e');

            test.done();
        });

    }
};