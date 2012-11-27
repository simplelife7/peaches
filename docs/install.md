## 安装
### 在Mac下安装
使用`npm`一键安装: 
        
        npm install peaches

注意：99%的全新安装都会失败，这是因为`node-canvas`有很多依赖，安装不成功的同学，请看下面【node-canvas的安装】。

安装完后，应该可以在命令行中执行一下命令：

        peaches --version
        
如果报`command not found` 的错误，那么需要检查一下`$PATH`配置, 请在 `~/.bash_profile`中配置
 
         export PATH="/usr/local/share/npm/bin/:$PATH"
       
当然你的npm bin 可能不在`/usr/local/share/npm/bin/`中，但你应该明白我的意思了。

配置完成之后，记得使用`source ~/.bash_profile`来激活刚才的配置。

#### node-canvas的安装
图片合并使用[node-canvas](https://github.com/LearnBoost/node-canvas)，安装前，请确保已经正确安装`node-canvas`。

#####【非官方安装指南】
1. 下载 [Xquartz](http://xquartz.macosforge.org/landing/)  [XQuartz-2.7.4.dmg](http://xquartz.macosforge.org/downloads/SL/XQuartz-2.7.4.dmg)
2. 安装好 Xquartz 后，安装 [Cairo](http://www.cairographics.org/) `brew install cairo`
3. 然后再尝试安装 `npm install node-canvas`
4. 如果安装成功，那么恭喜你，不然还可以看下面的官方安装指南。

#####【官方安装指南】

* [Installation OSX](https://github.com/LearnBoost/node-canvas/wiki/Installation---OSX)

注意原文档中的这句话：“Note; if libpng fails try [installing this binary](http://ethan.tira-thompson.com/Mac_OS_X_Ports.html)”



###  安装wget
程序使用`wget`下载图片，所以请确保安装了`wget`。
        
        brew install wget

关于brew，请[点击这里查看](http://mxcl.github.com/homebrew/)