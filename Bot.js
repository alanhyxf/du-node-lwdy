 /**
  * @file js-sdk bot demo
  * @author yelvye@baidu.com
  */
const Bot = require('bot-sdk');
let ConnUtils = require('./tools/ConnUtils');

 
const welcomeStr = '欢迎使用对诗李白，我会随机选择一句李白的诗，你来对下句。现在跟我说开始对诗吧！';
const helpStr = '抱歉我没有理解你的意思。说开始对诗开始吧。';
const defaultBkg = 'http://dbp-resource.gz.bcebos.com/92bb7de1-5d92-dab4-9c39-84c1998470a3/default.jpg?authorization=bce-auth-v1%2Fa4d81bbd930c41e6857b989362415714%2F2018-10-17T14%3A47%3A46Z%2F-1%2F%2Fcf2a0f8ff98250a2a00e592bb42b5f1d2d001e6ff96e24320548e5932615d0b0';
const titleStr = '对诗李白';
const PoemList = ["悯农","将进酒"];


class InquiryBot extends Bot {
    genToken(token) {
        let buffer = new Buffer(token.toString());

        return buffer.toString('base64');
    } 
   constructor(postData) {
        super(postData);

        this.addLaunchHandler(this.launch);

        this.addSessionEndedHandler(this.sessionEndedRequest);

        this.addIntentHandler('Regis', this.register);

        //悯农
        this.addIntentHandler('poem1', this.poem1Intent);

        //将进酒
        this.addIntentHandler('poem2', this.poem2Intent);

        //缺省意图
        this.addIntentHandler('ai.dueros.common.default_intent', this.CommonIntent);


        this.addDefaultEventListener(this.defaultEvent);
    }



    launch() {
        this.waitAnswer();
//        let template = this.getHomeCard();
        let self=this;
        let userid=this.request.getUserId();

	console.log('launch1:'+userid);

	let query_str ="SELECT username " +
				"FROM hy_users " +
				"WHERE (userid = ?) " +
				"LIMIT 1 ";
       let query_var=userid;
        return new Promise(function (resolve, reject) {
            let mysql_conn = ConnUtils.get_mysql_client();
            mysql_conn.query(query_str,query_var,function (error, results, fields) {
                console.log('launch2'+results);
		//if (typeof(results) != "undefined" && results.length > 0){
                if(!error){
		    resolve({
                        directives: [self.getTemplate1(results[0].username)],
                        outputSpeech: '欢迎你' + results[0].username 
                    });
                }else{
                    resolve({
                        directives: [self.getTemplate1(results[0].name)],
                        outputSpeech: '欢迎来到对诗李白。你还没登记账号呢吧。请发指令注册账号'
                    });
                }
            });
        });


    }


    getTemplate1(text) {
    	console.log(text);
        let bodyTemplate = new Bot.Directive.Display.Template.BodyTemplate1();
        bodyTemplate.setPlainTextContent(text);
        let renderTemplate = new Bot.Directive.Display.RenderTemplate(bodyTemplate);
        return renderTemplate;
    }



    register(){
        this.waitAnswer();
       let self=this;
        let userName = this.getSlot('username');
	console.log('系统获得姓名'+userName);
        if (!userName) {
            this.nlu.ask('username');
            let card = new Bot.Card.TextCard('你叫什么名字？');
            // 可以返回异步 Promise
            return Promise.resolve({
                card: card,
                outputSpeech: '你叫什么名字？'
            });
        }
    
        let userId = this.request.getUserId();
        let insertQuery = "INSERT INTO hy_users (userid, username, score) VALUES (' " + userId + "','" + userName + "','0')";
        console.log(insertQuery);
        return new Promise(function (resolve, reject) {
            let mysql_conn = ConnUtils.get_mysql_client();
            mysql_conn.query(insertQuery,function (error, results, fields) {
                resolve({
                    //directives: [self.getTemplate1(results)],
                    outputSpeech: '你好' + userName + ' 设置你的目标吧'
                });
            });
        });
    }

    sessionEndedRequest() {
        console.log("session end ");
        this.endDialog();
        return {
            outputSpeech: '多谢使用!'
        };

    }


   /**
     * 悯农
     *
     * @return {Object}
     */
    poem1Intent() {
        this.waitAnswer();
        let poem11 = this.getSlot('1-1');
        if(!poem11) {
        //询问slot: 1-1
            this.nlu.ask('1-1');
            let speech="锄禾日当午";
       //     let card = new TextCard('锄禾日当午');
            return {
         //       card: card,
                outputSpeech: speech,
                reprompt: speech,             
            };
        }

        console.log("answer is right");
        if (poem11) {      
            let speech = '你答对了';                 
            return {
                outputSpeech: speech,
            };
        }

    }

    CommonIntent() {
        this.waitAnswer();  
        console.log(this.request.getQuery());
        
        let speech = this.request.getQuery();
        let reprompt = this.request.getQuery();

        return {
            outputSpeech: speech,
            reprompt: reprompt,

        };
    }



}


module.exports = InquiryBot;
