## 安装
### 在Mac下安装
使用`npm`一键安装:
        
        npm install peaches
       
安装完后，应该可以在命令行中执行一下命令：

        peaches --version
        
如果报`command not found` 的错误，那么需要检查一下`$PATH`配置, 请在 `~/.bash_profile`中配置
 
         export PATH="/usr/local/share/npm/bin/:$PATH"
       
当然你的npm bin 可能不在`/usr/local/share/npm/bin/`中，但你应该明白我的意思了。

#### node-canvas的安装
图片合并使用[node-canvas](https://github.com/LearnBoost/node-canvas)，安装前，请确保已经正确安装[Cairo](http://cairographics.org/)。

###  安装wget
程序使用`wget`下载图片，所以请确保安装了`wget`。
        
        brew install wget

关于brew，请[点击这里查看](http://mxcl.github.com/homebrew/)