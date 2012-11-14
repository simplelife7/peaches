//#!/usr/bin/env node
var program = require('commander'),
    pkg = require('../package.json'),
    version = pkg.version,
    peaches = require('../lib/peaches'),
    logger = require('nlogger').logger('peaches');

program
    .version(version)
    .option('-p, --pkg <package.json>', '设置package.json的路径,默认使用当前目录下的package.json')
    .option('--src <src>', '设置需要处理的模块目录，默认是 ./src。')
    .option('--dist <dist>', '指定打包后的文件存储目录，默认是 ./dist。')
    .option('--images <images>', '指定图片下载路径及sprite图片保存的路径，默认是 ./images。')
    .option('--encoding <encoding>', '指定在进行文件处理时，涉及到的文件编码。 默认是 utf8 ')
    .parse(process.argv);

if (!program.pkg) {
    program.pkg = './package.json';
}
if (!program.src) {
    program.src = './src';
}
if (!program.encoding) {
    program.encoding = 'utf-8';
}
//logger.info(program.package);
