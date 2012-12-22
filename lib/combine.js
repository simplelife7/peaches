var fs = require('fs');
var path = require('path');
var url = require('url');
var http = require('http');
var forEachAsync = require('forEachAsync');

var Packer = require('./packer.js').Packer;
var Canvas = require('canvas');
var logger = require('colorful').logging;


function Combine(imageBucket, peaches, next) {
    'use strict';
    this.imageBucket = imageBucket;
    this.peaches = peaches;
    this.next = next;
    this._init();
}
Combine.prototype = {
    _init: function () {
        'use strict';
        var Server, self = this;
        this.packers = this.getPackers();
        var index = 0;
        forEachAsync(this.packers,function (callback, packer) {
            index += 1;
            packer.index = index;
            /**
             * 如果没有背景图片,则不进行图片的拼接
             */
            if (packer.blocks.length === 0) {
                return callback();
            }

            try {
                Server = require('./plugin/' + self.peaches.options.server.name);
            }
            catch (e) {
                logger.error('无法加载：{},使用默认配置', self.peaches.options.server.name);
                logger.error('error:{}', e);
                Server = require('./plugin/local');
            }

            packer.server = new Server(self.peaches.spriteName + '-' + index, self.peaches.options.server);
            packer.token = packer.server.token + index;
            self.drawImage(packer);
            packer.server.write(packer.canvas, function (err) {
                return callback();
            });
        }).then(function () {
                self.next(null, self.packers);
            });
    },
    getPackers: function () {
        'use strict';
        var self = this, blocks = [], //blocks 存储px的图片
        //vBlocks，存储left和right的图片，合并在最后
            vBlocks = [], i, image, file_path, file, canvasImage, pxMatch , pyMatch, packer,
            block, size,
            /**
             * 根据不同的规则，将需要合并的图片集中到同一个bucket中。
             * 比如按照合并图片的大小，如果大于一定的数值之后，自动合并到另一张图片中。
             * blockBucket = [
             *     {
             *         size:0,
             *         images:['http://1.png','./img.png'],
             *         blocks:[block]
             *     }
             * ]
             */
                blockBuckets = [
                {
                    size: 0,
                    images: [],
                    blocks: []
                }
            ], bucket;
        for (i in this.imageBucket.images) {
            if (this.imageBucket.images.hasOwnProperty(i)) {
                /**
                 * 只处理是图片的文件.
                 * @type {*}
                 */

                image = this.imageBucket.images[i];
                file_path = image.file;
                //获取图片的大小。
                size = fs.statSync(file_path).size;

                bucket = blockBuckets[blockBuckets.length - 1 ];
                /** TODO: 配置文件分割规则。
                 // 130000 需要设置为变量
                 if (bucket.size > 130000 * 1000000 - size) {
                    bucket = {size: 0, images: [], blocks: []};
                    blockBuckets.push(bucket);
                }
                 bucket.size += size;
                 */
                file = fs.readFileSync(file_path);
                if (file.toString() === '') {
                    logger.error('文件为空，请增加 `--clean` 参数后重试！！ 如：`peaches --clean`');
                    process.exit(1);
                }
                canvasImage = new Canvas.Image();
                canvasImage.src = file;

                block = {
                    w: canvasImage.width,
                    h: canvasImage.height,
                    path: file_path,
                    canvasImage: canvasImage,
                    image: image
                };


                // 如果是 left right的情况(并且position-y为px);
                pxMatch = image.positions[0].match(/left|right/i);
                if (pxMatch) {
                    pyMatch = image.positions[0].match(/%|in|cm|mm|em|ex|pt|pc|center|top|bottom/i);
                    if (pyMatch) {
                        break;
                    }

                    vBlocks.push(block);
                }
                else {
                    bucket.blocks.push(block);
                }
            }
        }
        var packers = [];
        blockBuckets.forEach(function (bucket) {
            blocks = bucket.blocks;
            if (self.peaches.options.sort === '1') {
                blocks.sort(function (a, b) {
                    return b.w - a.w;
                });
            }
            else {
                blocks.sort(function (a, b) {
                    return b.h - a.h;
                });
            }

            packer = new Packer();
            packer.fit(blocks);
            packer.blocks = blocks;
            packer.vBlocks = [];
            packer.bucket = bucket;
            packers.push(packer);
        });
        //vBlocks 更新到最后一个图片中。
        vBlocks.sort(function (a, b) {
            return b.w - a.w;
        });
        packers[packers.length - 1 ].vBlocks = vBlocks;
        return packers;
    },
    updatePosition: function (packer, block, x, y) {
        'use strict';
        var url = block.image.url, self = this,
            backgroundImage , positions, positionsX, positionsY;
        this.peaches.pom.styleSheet.cssRules.forEach(function (rule, idx) {
            // 如果是CSS3 函数
            if (!rule.style) {
                return;
            }
            backgroundImage = rule.style.getPropertyValue('background-image');
            positions = rule.style.getPropertyValue('background-position') || '0 0';


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

            if (positions.match(self.peaches.options.ignorePosition)) {
                return;
            }


            positions = positions.split(/\s+/);

            /**
             * 如果只有一个postions的情况,那么第二个postion的值为50%;
             * 这种情况不处理.
             * by biyue 目前测试出来的结果第二个值是NaNpx 2012.11.19
             * ??解析出来是有值的 firefox是center;chrome是50%，不存在length==1的情况
             */
            if (positions.length === 1) {
                logger.warn('position值只有1个时不做合并处理');
                return;
            }
            switch (positions[0].toLowerCase()) { //避免属性出现大写的情况['LEFT CENTER','Left 0'] 2012.11.19 by biyue
                case 'left':
                    positionsX = 'left ';
                    break;
                case 'right':
                    positionsX = 'right ';
                    break;
                case 'center':
                    positionsX = 'center '; //水平center的需要支持 2012.11.19 by biyue
                    break;
                default :
                    positionsX = parseInt(positions[0], 10) - x;
                    //当值为0时不添加px 2012.11.19 by biyue
                    positionsX += (positionsX === 0 ) ? ' ' : 'px ';
            }
            positionsY = parseInt(positions[1], 10) - y;
            //当值为0时不添加px 2012.11.19 by biyue
            positionsY += (positionsY === 0 ) ? '' : 'px';

            rule.style.setProperty('background-image', 'url(' + packer.token + ')');
            rule.style.setProperty('background-position', positionsX + positionsY);

            /**
             * 自动更新width:auto heigth:auto的元素
             */
            if (rule.style.getPropertyValue('width') === 'auto') {
                rule.style.setProperty('width', block.w + 'px');
            }
            if (rule.style.getPropertyValue('height') === 'auto') {
                rule.style.setProperty('height', block.h + 'px');
            }
        });
    },
    drawImage: function (packer) {
        'use strict';
        var width = packer.root.w,
            height = packer.root.h,
            n, block, x, y,
            canvas, ctx;
        /** 计算画布的宽高 开始...**/
        /**
         * 先得到混合排列容器需要的宽度\高度
         * 将垂直排列的图片的宽高,加入到容器宽高中.
         */
        for (n = 0; n < packer.vBlocks.length; n++) {
            block = packer.vBlocks[n];
            if (width < block.w) {
                width = block.w;
            }
            height += block.h;
        }
        /** 计算画布的宽高 结束...**/


        canvas = new Canvas(width, height);
        packer.canvas = canvas;
        ctx = canvas.getContext('2d');


        /** 紧凑排序图片 开始... **/
        for (n = 0; n < packer.blocks.length; n++) {
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
            this.updatePosition(packer, block, x, y);
        }
        /** 紧凑排序图片 结束... **/

        /** 垂直图片排序 开始... **/
        x = 0;
        y = packer.root.h;
        for (n = 0; n < packer.vBlocks.length; n++) {
            block = packer.vBlocks[n];
            //根据position 设置是否紧贴图片边缘.
            switch (block.image.positions[0]) {
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
            this.updatePosition(packer, block, block.image.positions[0], y);
            y += block.h;
        }
        /** 垂直图片排序 结束... **/

    }
};
module.exports = Combine;