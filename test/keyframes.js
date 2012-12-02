var peaches = require('../lib/peaches');
var path = require('path');
var cssom = require('cssom');
var peachesConfig = {
    "name":"local",
    "root":path.join(__dirname, "./images"),
    "tmp":path.join(__dirname, "./tmp"),
    "baseURI":"../images/"
};
module.exports = {
    setUp:function (callback) {
        'use strict';
        this.styleText = "@-webkit-keyframes progress-bar-stripes {" +
            "from {" +
            "    background-position: 40px 0;" +
            "}" +
            "to {" +
            "    background-position: 0 0;" +
            "}" +
            "}";

        var self = this;
        peaches(this.styleText, peachesConfig, function (err, newStyleText, peaches) {
            self.styleSheet = cssom.parse(newStyleText);
            callback();
        }, 'peaches');

    },
    tearDown:function (callback) {
        'use strict';
        callback();
    },
    test1:function (test) {
        'use strict';
        var text = this.styleSheet.toString();
        text = text.replace(/\s/g, '');
        test.equals(text, this.styleText.replace(/\s/g, ''));
        test.done();
    }
};