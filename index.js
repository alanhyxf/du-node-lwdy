/**
 * @file 启动入口文件
 * @author yelvye@baidu.com
 * NOTICE:
 *      安装依赖
 *      npm install
 */

const express = require('express');
const InquiryBot = require('./Bot');
var querystring = require('querystring');
let app = express();


var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser('sessiontest'));
app.use(session({
    secret: 'sessiontest',//与cookieParser中的一致
    resave: true,
    saveUninitialized:true
}));


// 探活请求
app.head('/lwdy', (req, res) => {
    res.sendStatus(204);
});

app.post('/lwdy', (req, res) => {
    req.rawBody = '';
    var body='';	
    req.setEncoding('utf8');
    req.on('data', chunk => {
        req.rawBody += chunk;
    });

    req.on('end', () => {
	if (req.rawBody=='')
	{
		//console.log('null post');
	        return null;
	}
	let b = new InquiryBot(JSON.parse(req.rawBody)); 
        
        // 开启签名认证
        // 本地运行可以先注释
        //b.initCertificate(req.headers, req.rawBody).enableVerifyRequestSign();

        b.run().then(result => {
            res.send(result);
        });
    });
}).listen(8017);

console.log('listen 8017');
