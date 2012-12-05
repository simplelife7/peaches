package.json
=========
`package.json`提供CSS打包编译规则，可以位于CSS文件的目录中。一个较完整的 package 文件看起来如下：

    {
    "output": {
        "./dist/peaches.css": [
            "./src/base.css",
            "./src/button.css",
            "./src/index.css"
        ],
        "./dist/test.css": [
            "./src/test.css"
        ]
    },
    "server": {
        "build": {
            "name": "local",
            "root": "./images",
            "tmp": "./images",
            "baseURI": "../images/"
        },
        "deploy": {
            "name": "upyun",
            "root": "./images",
            "tmp": "./images",
            "username": "peaches",
            "password": "69a:6Ke)9Va66G2x",
            "bucket":"peaches",
            "baseURI": "http://peaches.b0.upaiyun.com/"
        }
    }
    }

其中主要又两个字段：`output` 和 `server`。
## output
`output`定义文件打包规则，如上面的例子中，将合并两个成两个CSS文件。`./dist/peaches.css` 文件由三个文件组成，文件安装数组的顺序合并。  
这里key和value都应该安装`package.json`的相对位置设置。

## server
 生成合并图片时会用到server配置。
 
### build
当使用`peaches build`时， 使用   `build` 中的配置。（见：deploy 的说明）

这样设计的考虑是，`build`时，假定样式在不断的修改中，有可能会增加很多背景图片，会不断的生成合并图片。但`deploy`时，所有的开发都已经完成，这时会将合并图片上传到线上静态服务器。

### deploy
 使用`peaches deploy`时，使用 `deploy` 配置。
 
### local
配置静态服务器插件，默认支持本地方式。

#### name
本地方式，请设置为：`local`

#### root
配置合并图片放置的目录。

#### tmp
temp目录用于保存下载的图片。  
推荐将样式中的图片全部使用绝对地址的方式，`peaches`会自动下载需要合并的图片到tmp目录中。

#### baseURI
用于组装图片URL
baseURI 返回的图片名称为: baseURI + 图片名称。


### upyun
配置静态服务器插件，自动将合并后的图片文件上传到 upyun服务器,一个例子：

    "server": {
        "deploy": {
            "name": "upyun",
            "username": "peaches",
            "password": "69a:6Ke)9Va66G2x",
            "bucket":"peaches",
            "baseURI": "http://peaches.b0.upaiyun.com/"
        }
    }

注意： 这里的upyun操作员用户名和密码只能当做测试使用，会定期清理里面的文件，请勿当作正式的图片地址使用！

#### name
请设置为：`upyun`

#### root 
配置合并图片放置的目录。

#### tmp
temp目录用于保存下载的图片。  

#### username
`upyun` 操作员用户名
#### password
`upyun` 操作员密码

#### bucket
自动上传到`upyun`的哪个`bucket`

#### baseURI
用于组装图片URL
baseURI 返回的图片名称为: baseURI + 图片名称。

### alipayobjects
配置静态服务器插件，自动将合并后的图片文件上传到 alipay CDN，仅供内部使用，具体文档请[点击这里查看](http://doc.alipay.net/pages/viewpage.action?pageId=40307104)


