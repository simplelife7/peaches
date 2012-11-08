var fs = require('fs');
var path = require('path');
var url = require('url');
var http = require('http');

var Packer = require('./packer.js').Packer;
var Canvas = require('Canvas');


function Combine(imageBucket, peache) {
    this.tmpSpritUrl = 'tmpSpritUrl' + +new Date()
    this.imageBucket = imageBucket;
    this.peache = peache;

    this._init();
}
Combine.prototype = {
    _init:function () {
        this.packer = this.getPacker();
        /**
         * 如果没有背景图片,则不进行图片的拼接
         */
        if (this.packer.blocks.length == 0) {
            return;
        }

        try {
            var Sprite = require('./plugin/' + this.peache.options.sprite.name);
        }
        catch (e) {
            var Sprite = require('./plugin/nginx');
        }
        var cssName = path.basename(this.peache.cssFile).replace('.css', '');
        this.sprite = new Sprite(cssName, this.peache.options.sprite);
        this.drawImage();
        this.sprite.wirte(this.canvas);

    },
    getPacker:function () {

        var blocks = [],
        //垂直的图片,用于position为left和right的图片
            vBlocks = [],
        //水平的图片,用于position为top和bottom的图片
            hBlocks = [];
        for (var i in this.imageBucket.images) {
            /**
             * 只处理是图片的文件.
             * @type {*}
             */
            var image = this.imageBucket.images[i];
            var file_path = image.file;
            var file = fs.readFileSync(file_path);
            var canvasImage = new Canvas.Image();
            canvasImage.src = file;
            var block = {
                w:canvasImage.width,
                h:canvasImage.height,
                path:file_path,
                canvasImage:canvasImage,
                image:image
            }
            var pxMatch , pyMatch;
            // 如果是 left right的情况(并且position-y为px);
            if (pxMatch = image.p[0].match(/left|right/i)) {
                if (pyMatch = image.p[0].match(/%|in|cm|mm|em|ex|pt|pc|center|top|bottom/i)) {
                    break;
                }
                vBlocks.push(block);
            }
            else {
                blocks.push(block);
            }
        }
        blocks.sort(function (a, b) {
            return b.h - a.h;
        });
        vBlocks.sort(function (a, b) {
            return b.w - a.w;
        });
        var packer = new Packer();
        packer.fit(blocks);
        packer.blocks = blocks;
        packer.vBlocks = vBlocks;
        return packer;
    },
    updatePosition:function (block, x, y) {
        var url = block.image.url, self = this;
        var backgroundImage , positions, positionsX, positionsY;
        this.peache.pom.cssom.cssRules.forEach(function (rule, idx) {
            backgroundImage = rule.style.getPropertyValue('background-image');
            positions = rule.style.getPropertyValue('background-position') || '0 0';

            /**
             * 如果只有一个postions的情况,那么第二个postion的值为50%;
             * 这种情况不处理.
             */
            if (positions.length == 1) {
                return;
            }

            /**
             *  如果这个rule没有这个样式,不处理
             */
            if (backgroundImage.indexOf(url) < 0) {
                return;
            }
            /**
             *  如果存在 left right 这种定位
             *  不处理
             */

            if (positions.match(self.peache.options.ignorePosition)) {
                return;
            }
            positions = positions.split(/\s+/);

            console.log(positions, x, y)

            switch (positions[0]) {
                case 'left':
                    positionsX = 'left ';
                    break;
                case 'right':
                    positionsX = 'right ';
                    break;
                default :
                    positionsX = parseInt(positions[0], 10) - x;
                    positionsX += 'px ';
            }

            positionsY = parseInt(positions[1], 10) - y;
            positionsY += 'px';

            rule.style.setProperty('background-image', 'url(' + self.sprite.url + ')');
            rule.style.setProperty('background-position', positionsX + positionsY);

            /**
             * 自动更新width:auto heigth:auto的元素
             */
            if (rule.style.getPropertyValue('width') == 'auto') {
                rule.style.setProperty('width', block.w + 'px');
            }
            if (rule.style.getPropertyValue('height') == 'auto') {
                rule.style.setProperty('height', block.h + 'px');
            }
        });
    },
    drawImage:function () {
        var packer = this.packer, block, x, y;

        /** 计算画布的宽高 开始...**/
        /**
         * 先得到混合排列容器需要的宽度\高度
         * 将垂直排列的图片的宽高,加入到容器宽高中.
         */
        var width = packer.root.w, height = packer.root.h;
        for (var n = 0; n < packer.vBlocks.length; n++) {
            block = packer.vBlocks[n];
            if (width < block.w) {
                width = block.w;
            }
            height += block.h;
        }
        /** 计算画布的宽高 结束...**/


        var canvas = new Canvas(width, height);
        this.canvas = canvas;
        var ctx = canvas.getContext('2d');


        /** 紧凑排序图片 开始... **/
        for (var n = 0; n < packer.blocks.length; n++) {
            block = packer.blocks[n];
            if (block.fit) {
                x = block.fit.x;
                y = block.fit.y;
            }
            else {
                x = 0;
                y = 0;
            }
            ctx.drawImage(block.canvasImage, x, y);
            this.updatePosition(block, x, y);
        }
        /** 紧凑排序图片 结束... **/

        /** 垂直图片排序 开始... **/
        x = 0, y = packer.root.h;
        for (var n = 0; n < packer.vBlocks.length; n++) {
            block = packer.vBlocks[n];
            //根据position 设置是否紧贴图片边缘.
            switch (block.image.p[0]) {
                case 'right':
                    x = canvas.width - block.w;
                    break;
                case 'left':
                    x = 0;
                    break;
                default :
                    x = 0;
                    break;
            }
            ctx.drawImage(block.canvasImage, x, y);
            this.updatePosition(block, block.image.p[0], y);
            y += block.h;
        }
        /** 垂直图片排序 结束... **/

    }
}
module.exports = exports = Combine;