'use strict';
function mergerBackgroundProperty(style, property, value) {
    /**
     * 如果没有定义单独的属性.那么直接添加该属性.
     * div{
     *     background:#ccc url(./img.png);
     * }
     * 设置后,应该为:
     * div{
     *     background-image:url(./img.png);
     *     background-color:#ccc;
     * }
     */
    if (style.getPropertyValue(property) === '') {
        style.setProperty(property, value);
        return style;
    }
    /**
     * 如果存在单独定义的属性,并且为!important
     * background 没有设置!important;
     * 不设置
     * div{
     *     background-color:red!important;
     *     background:#ccc url(./img.png);
     * }
     * 设置后,应该为:
     * div{
     *     background-image:url(./img.png);
     *     background-color:red!important;
     * }
     */
    if (style.getPropertyPriority(property) !== '' && style.getPropertyPriority('background') === '') {
        return style;
    }
    if (style.getPropertyPriority(property) === '' && style.getPropertyPriority('background') !== '') {
        style.setProperty(property, value + ' !' + style.getPropertyPriority('background'));
        return style;
    }

    /**
     * 下面是定义了单独属性,并且不为important的情况.
     * 需要根据定义的先后顺序来设置值.
     * 比如:
     * div{
     *     background:#ccc url(./img.png);
     *     background-color:red;
     * }
     * 设置后,应该为:
     * div{
     *     background-image:url(./img.png);
     *     background-color:red;
     * }
     */
    var singlePropertyIndex, // 单独配置的属性的index
        complexPropertyIndex, // 复合配置的属性的index
        i,
        important;
    for (i = 0; i < style.length; i++) {
        if (style[i] === property) {
            singlePropertyIndex = i;
        } else if (style[i] === 'background') {
            complexPropertyIndex = i;
        }
    }
    /**
     *  如果复合属性的index  大于 单独属性的index
     *  使用复合属性值
     */
    if (complexPropertyIndex > singlePropertyIndex) {
        important = style.getPropertyPriority(property);
        if (important) {
            value += ' !' + important;
        }
        style.setProperty(property, value);
    }
    return style;
}
var MATCH_ACTION = [
    {
        //background-image
        regexp: /\b(url\([^\)]+\))/i,
        exec: function (style, match) {
            mergerBackgroundProperty(style, 'background-image', match[1]);
        }
    },
    {
        //background-repeat
        regexp: /((no-repeat)|(repeat-x)|(repeat-y)|(repeat))/i,
        exec: function (style, match) {
            mergerBackgroundProperty(style, 'background-repeat', match[1]);
        }
    },
    {
        //background-attachment
        regexp: /\b(fixed|scroll)\b/i,
        exec: function (style, match) {
            mergerBackgroundProperty(style, 'background-attachment', match[1]);
        }
    },
    {
        //background-origin, background-clip
        //使用简写的时候 origin 是比 clip 优先的
        regexp: /(\b(border|padding|content)-box)/i,
        exec: function (style, match) {
            mergerBackgroundProperty(style, 'background-origin', match[1]);
        }
    },
    {
        //background-clip
        regexp: /(\b(border|padding|content)-box)/i,
        exec: function (style, match) {
            mergerBackgroundProperty(style, 'background-clip', match[1]);
        }
    },
    {
        //background-position
        //两个值都设定的情况.
        regexp: /((-?\d+(%|in|cm|mm|em|ex|pt|pc|px))|0|center|left|right)\s+((-?\d+(%|in|cm|mm|em|ex|pt|pc|px))|0|center|top|bottom)/i,
        exec: function (style, match) {

            //position值为left时处理成0 2012-11-20 by biyue
            var cur = match[0].split(/\s+/)
            if(cur[0] == 'left') cur[0] = '0';
            match[0] = cur.join(' ')

            mergerBackgroundProperty(style, 'background-position', match[0]);
        }
    },

    {
        //background-position
        //设定单个值的情况. 浏览器会默认设置第二个值 50%,这里不推荐这样写.
        regexp: /\s+((-?\d+(%|in|cm|mm|em|ex|pt|pc|px))|0|center|left|right)/,
        exec: function (style, match) {
            return;
            //TODO:支持单个postion的写法,但是要注意,如果匹配了两个postion的情况后,不能在匹配单个的.
            //mergerBackgroundProperty(style, 'background-position', match[0] + ' 50%');
        }
    },

    {
        //background-color: #fff
        regexp: /(^#([0-9a-f]{3}|[0-9a-f]{6})\b)/i,
        exec: function (style, match) {
            mergerBackgroundProperty(style, 'background-color', match[1]);
        }
    },
    {
        //background-color: rgb()
        regexp: /(\brgb\(\s*([0-9]{1,2}|1[0-9]|2[0-4][0-9]|25[0-5])\s*,([0-9]{1,2}|1[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([0-9]{1,2}|1[0-9]|2[0-4][0-9]|25[0-5])\s*\))/i,
        exec: function (style, match) {
            mergerBackgroundProperty(style, 'background-color', match[1]);
        }
    },
    {
        //background-color: rgba()
        regexp: /(\brgba\((\s*(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])\s*,){3}\s*(0?\.[0-9]+|[01])\s*\))/i,
        exec: function (style, match) {
            mergerBackgroundProperty(style, 'background-color', match[1]);

        }
    },
    {
        //background-color: color-name
        //W3C 的 HTML 4.0 标准仅支持 16 种颜色名, 加上 orange + transparent 一共 18 种
        regexp: /\b(aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|purple|red|silver|teal|white|yellow|orange|transparent)\b/i,
        exec: function (style, match) {
            mergerBackgroundProperty(style, 'background-color', match[1]);
        }
    }
];

var separator = function (style) {
    var background = style.getPropertyValue('background'),
        matched = false;
    if (!background) {
        return style;
    }

    //TODO: 多背景图片处理
    /**
     * 不能简单的通过 , 来区分,因为存在 rgb(1,1,1) 这种格式.
     var backgrounds = background.split(',') ;
     if (backgrounds.length > 1) {
        return style;
    }*/

    /**
     * 拆封背景
     */

    MATCH_ACTION.forEach(function (action) {
        var match = background.match(action.regexp);
        if (match) {
            action.exec(style, match);
            matched = true;
        }
    });
    /**
     * 但匹配到一直值后,会将background属性删除.
     * 这里有个风险,如果用户设置了一个这里这里没有匹配的值,那么将丢失该值.
     */
    if (matched) {
        style.removeProperty('background');
    }
};

module.exports = separator;