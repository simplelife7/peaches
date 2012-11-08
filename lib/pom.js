/**
 * pom.js 负责将styleText(样式表文本)处理成 POM对象
 */

var cssom = require('cssom');
var separator = require('./separator');
var merger = require('./merger');
/**
 * peaches object models
 */
function POM(styleText) {
    this.styleText = styleText;
    this._init();
}
POM.prototype = {
    _init:function () {
        this.styleSheet = cssom.parse(this.styleText);
        merger(this.styleSheet);
        this.splitBackground();
    },
    /**
     * 拆封background
     */
    splitBackground:function () {
        this.styleSheet.cssRules.forEach(function (cssRule) {
            separator(cssRule.style);
        });
    }
}
module.exports = exports = POM;
if (!module.parent) {
    var fs = require('fs'), path = require('path');
    var styleText = fs.readFileSync(path.join(__dirname, '/test/style.css')).toString();
    pom = new POM(styleText);
}