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
        this.styleText = '' +
            'span{background:url("https://i.alipayobjects.com/e/201206/3KWk6Hcenj.png")}' +
            'div{background:#ccc}' +
            'strong{background:10px 10px;}';
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
        this.styleSheet.cssRules.forEach(function (rule, idx) {
            switch (rule.selectorText) {
                case 'span':
                    test.equals(rule.style.getPropertyValue('background-image'), 'url(../images/sprite-peaches.png)');
                    break;
                case 'div':
                    test.equals(rule.style.getPropertyValue('background-color'), '#ccc');
                    break;
                case 'strong':
                    test.equals(rule.style.getPropertyValue('background-position'), '10px 10px');
                    break;
                default :
                    break;
            }
        });
        test.done();
    }
};