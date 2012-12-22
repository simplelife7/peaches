var cssom = require('cssom');

var logger = require('colorful').logging;
/**
 * Merger函数,将CSSOM对象中,一些合并selector的样式拆分开, 使得每一个选择器只存在一个独立的样式块.
 * 比如:
 * div,a{
 *   background-color: red;
 * }
 * a{
 *    background: #ccc;
 * }
 * 将处理成:
 * div {
 *    background-color: red;
 * }
 *
 * a {
 *   background-color: #ccc;
 * }
 * 目的是合并background-image 和 background-position,这样才能将更新后的position计算正确.
 * @param styleSheet 为一个CSSOM对象.
 * @return {Merger}
 * @constructor
 */
function Merger(styleSheet) {
    'use strict';
    if (!(this instanceof Merger)) {
        return new Merger(styleSheet);
    }
    this.styleSheet = styleSheet;
    this._init();
}
Merger.prototype = {
    _init:function () {
        'use strict';
        this.countSelectors();
    },
    countSelectors:function () {
        'use strict';
        var self = this, rule, important, selector, selectors, i, len;
        this.selectorRules = {};
        this.rules = [];
        this.styleSheet.cssRules.forEach(function (cssRule) {
            // 如果是CSS function
            if (!cssRule.selectorText) {
                self.rules.push(cssRule);
                return;
            }
            //将selectorText按照逗号分割,将每个选择器独立开.
            selectors = cssRule.selectorText.split(',');
            selectors.forEach(function (selector) {
                selector = selector.trim();
                rule = self.selectorRules[selector];
                // 如果已经存在该选择器的样式,那么合并改选择器
                if (rule) {
                    for (i = 0, len = cssRule.style.length; i < len; i++) {
                        important = cssRule.style.getPropertyPriority(cssRule.style[i]).trim();
                        var ruleImportant = rule.style.getPropertyPriority(cssRule.style[i]).trim();
                        // 如果原先没有important，那么直接设置。
                        // 如果原先有important，并且后面的属性也是important的，那么也需要设置后面的值。
                        // 其余情况，则保持原先的设置：如原先又important，后面没有important
                        if (!ruleImportant || ruleImportant && important) {
                            rule.style.setProperty(cssRule.style[i], cssRule.style.getPropertyValue(cssRule.style[i]), important);
                        }
                    }
                }
                // 如果不存在该选择器的样式,那么新建一个样式.
                else {
                    self.selectorRules[selector] = self.cloneRule(cssRule, selector);
                }
            });
        });

        for (selector in this.selectorRules) {
            if (this.selectorRules.hasOwnProperty(selector)) {
                rule = this.selectorRules[selector];
                this.rules.push(rule);
            }
        }
        this.styleSheet.cssRules = this.rules;
    },
    cloneRule:function (cssRule, selectorText) {
        'use strict';
        var cssStyleRule = new cssom.CSSStyleRule(), important, i, len;
        cssStyleRule.selectorText = selectorText;
        for (i = 0, len = cssRule.style.length; i < len; i++) {
            important = cssRule.style.getPropertyPriority(cssRule.style[i]).trim();
            cssStyleRule.style.setProperty(cssRule.style[i],
                cssRule.style.getPropertyValue(cssRule.style[i]), important);
        }
        return cssStyleRule;
    }
};

module.exports = Merger;