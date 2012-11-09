var fs = require('fs');
var path = require('path')
var _ = require('underscore');

function Sprite(name, config) {
    this.serverName = 'nginx';
    this.options = {
        //sprite图片前缀
        prefix:'sprite',
        //图片文件保存的目录
        root:__dirname,
        //访问图片的url
        baseURI:'http://static.peaches.net/peaches/'
    }
    this.options = _.extend(this.options, config);
    this.name = this.options.prefix + '-' + name + '.png';
    this.name = path.join(this.options.root, this.name)
    this.url = this.options.baseURI + this.name;
}
Sprite.prototype = {
    wirte:function (canvas) {
        var buffer = canvas.toBuffer();
        fs.writeFileSync(this.name, buffer);
    }
}

module.exports = exports = Sprite;