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
            // 同一个选择器，合并
            'test1{color:red}' +
            'test1{border:1px solid #ccc}' +
            'test1,test2{margin:10px}' +
            'test2,test3{margin:100px}' +
            'test4{padding:10px;margin:10px!important;}' +
            'test4{padding:5px;margin:5px;}' +
            'test5{margin:5px!important;}' +
            'test5{margin:10px;}' +
            'test5{margin:100px!important;}';

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
                case 'test1':
                    test.equals(rule.style.getPropertyValue('color'), 'red');
                    test.equals(rule.style.getPropertyValue('border'), '1px solid #ccc');
                    test.equals(rule.style.getPropertyValue('margin'), '10px');
                    break;
                case 'test2':
                    test.equals(rule.style.getPropertyValue('margin'), '100px');
                    break;
                case 'test3':
                    test.equals(rule.style.getPropertyValue('margin'), '100px');
                    break;
                case 'test4':
                    test.equals(rule.style.getPropertyValue('margin'), '10px');
                    test.equals(rule.style.getPropertyValue('padding'), '5px');
                    break;
                case 'test5':
                    test.equals(rule.style.getPropertyValue('margin'), '100px');
                    break;
                default :
                    break;
            }
        });
        test.done();
    }
};