var cssom = require('cssom');

function Merger(styleSheet) {
    if (!(this instanceof Merger)) {
        return new Merger(styleSheet);
    }
    this.styleSheet = styleSheet;
    this._init();
}
Merger.prototype = {
    _init:function () {
        this.countSelectors();
    },
    countSelectors:function () {
        this.selectorRules = {};
        this.rules = [];
        var self = this, rule, important;
        this.styleSheet.cssRules.forEach(function (cssRule) {
            selectors = cssRule.selectorText.split(',');
            selectors.forEach(function (selector) {
                selector = selector.trim();
                if (rule = self.selectorRules[selector]) {
                    for (var i = 0, len = cssRule.style.length; i < len; i++) {
                        important = cssRule.style.getPropertyPriority(cssRule.style[i]).trim();

                        rule.style.setProperty(cssRule.style[i], cssRule.style.getPropertyValue(cssRule.style[i]), important);
                    }
                }
                else {
                    self.selectorRules[selector] = self.cloneRule(cssRule, selector);
                }
            });
        });

        for (var selector in this.selectorRules) {
            var rule = this.selectorRules[selector];
            this.rules.push(rule);
        }
        this.styleSheet.cssRules = this.rules;
    },
    cloneRule:function (cssRule, selectorText) {
        var cssStyleRule = new cssom.CSSStyleRule(), important;
        cssStyleRule.selectorText = selectorText;
        for (var i = 0, len = cssRule.style.length; i < len; i++) {
            important = cssRule.style.getPropertyPriority(cssRule.style[i]).trim();

            cssStyleRule.style.setProperty(cssRule.style[i], cssRule.style.getPropertyValue(cssRule.style[i]), important);
        }
        return cssStyleRule;
    }
}

module.exports = exports = Merger;