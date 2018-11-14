 /**
  * @file js-sdk bot demo
  * @author yelvye@baidu.com
  */
 //分跟读，接龙 还有 测试模式
 //
const bkpic = 'http://dbp-resource.gz.bcebos.com/e18a6c56-f4a0-56e9-3b3e-f2d778250855/bk1.jpg?authorization=bce-auth-v1%2Fa4d81bbd930c41e6857b989362415714%2F2018-11-14T00%3A31%3A26Z%2F-1%2F%2F39c617c36070c450942facc16b4ae119ccf9b9ebb52e7a8be7ffbb294b5a36b2';
const titleStr = '国学闯关';

const book01pic='http://dbp-resource.gz.bcebos.com/e18a6c56-f4a0-56e9-3b3e-f2d778250855/book1.jpg?authorization=bce-auth-v1%2Fa4d81bbd930c41e6857b989362415714%2F2018-11-14T01%3A00%3A10Z%2F-1%2F%2F605dcdceae2b38620630b9323b80026ccf42fbd305ebdbcdc15284805bfe1200';
const book01Str = '笠翁对韵';
const book02pic='http://dbp-resource.gz.bcebos.com/e18a6c56-f4a0-56e9-3b3e-f2d778250855/book2.jpg?authorization=bce-auth-v1%2Fa4d81bbd930c41e6857b989362415714%2F2018-11-14T01%3A00%3A10Z%2F-1%2F%2F74a35bd2f43221e5d87f8ab279b4a074e4a9744d22ae9dacf6f1744b9a61399a';
const book02Str = '论语';

const book01 = require('./book01');


const Bot = require('bot-sdk');
let ConnUtils = require('./tools/ConnUtils');
const privateKey = require("./rsaKeys.js").privateKey;



const RenderTemplate = Bot.Directive.Display.RenderTemplate;
const ListTemplate1 =Bot.Directive.Display.Template.ListTemplate1;
const ListTemplateItem = Bot.Directive.Display.Template.ListTemplateItem;
const PushStack = Bot.Directive.Display.PushStack;

class GuoxueBot extends Bot {

    genToken(token) {
        let buffer = new Buffer(token.toString());
        return buffer.toString('base64');
    } 

   constructor(postData) {
        super(postData);
        this.addLaunchHandler(this.launch);
        this.addSessionEndedHandler(this.sessionEndedRequest);
        //选书、章节操作
        this.addEventListener('Display.ElementSelected', this.showBook);
        //学习模式
        this.addIntentHandler('learn_intent', this.learnIntent);
        //重新开始
        this.addIntentHandler('newGame_intent', this.newGame);
        //默认意图
        this.addIntentHandler('ai.dueros.common.default_intent', this.CommonIntent);
        this.addDefaultEventListener(this.defaultEvent);
    }

    launch() {
        this.waitAnswer();
        console.log('begin launch');
    }


    //显示书籍目录
    showBook(event)
    {
        this.waitAnswer();
        let token = event.token;
        console.log('console log token',token);
        if (token=='book01'){
            let listTemplate = new ListTemplate1();
            listTemplate.setToken('chapter01');
            listTemplate.setBackGroundImage(bkpic);
            listTemplate.setTitle(book01Str);

            let Item1 = new ListTemplateItem();
            Item1.setToken('chapter0101');
            Item1.setImage(book01pic, 200, 200);
            Item1.setPlainPrimaryText('一 东');
            Item1.setPlainSecondaryText('跟读 0 测试 0');

            let Item2 = new ListTemplateItem();
            Item2.setToken('chapter0102');
            Item2.setImage(book01pic, 200, 200);
            Item2.setPlainPrimaryText('二 冬');
            Item2.setPlainSecondaryText('跟读 0 测试 0');

            let Item3 = new ListTemplateItem();
            Item3.setToken('chapter0103');
            Item3.setImage(book01pic, 200, 200);
            Item3.setPlainPrimaryText('三 江');
            Item3.setPlainSecondaryText('跟读 0 测试 0');

            let Item4 = new ListTemplateItem();
            Item4.setToken('chapter0103');
            Item4.setImage(book01pic, 200, 200);
            Item4.setPlainPrimaryText('四 支');
            Item4.setPlainSecondaryText('跟读 0 测试 0');

            let Item5 = new ListTemplateItem();
            Item5.setToken('chapter0103');
            Item5.setImage(book01pic, 200, 200);
            Item5.setPlainPrimaryText('五 微');
            Item5.setPlainSecondaryText('跟读 0 测试 0');

            let Item6 = new ListTemplateItem();
            Item6.setToken('chapter0103');
            Item6.setImage(book01pic, 200, 200);
            Item6.setPlainPrimaryText('六 鱼');
            Item6.setPlainSecondaryText('跟读 0 测试 0');

             let Item7 = new ListTemplateItem();
            Item7.setToken('chapter0103');
            Item7.setImage(book01pic, 200, 200);
            Item7.setPlainPrimaryText('七 虞');
            Item7.setPlainSecondaryText('跟读 0 测试 0');
            
            let Item8 = new ListTemplateItem();
            Item8.setToken('chapter0103');
            Item8.setImage(book01pic, 200, 200);
            Item8.setPlainPrimaryText('八 齐');
            Item8.setPlainSecondaryText('跟读 0 测试 0');

            let Item9 = new ListTemplateItem();
            Item9.setToken('chapter0103');
            Item9.setImage(book01pic, 200, 200);
            Item9.setPlainPrimaryText('九 佳');
            Item9.setPlainSecondaryText('跟读 0 测试 0');

            let Item10 = new ListTemplateItem();
            Item10.setToken('chapter0103');
            Item10.setImage(book01pic, 200, 200);
            Item10.setPlainPrimaryText('十 灰');
            Item10.setPlainSecondaryText('跟读 0 测试 0');

            let Item11 = new ListTemplateItem();
            Item11.setToken('chapter0103');
            Item11.setImage(book01pic, 200, 200);
            Item11.setPlainPrimaryText('十 一 真');
            Item11.setPlainSecondaryText('跟读 0 测试 0');

            let Item12 = new ListTemplateItem();
            Item12.setToken('chapter0103');
            Item12.setImage(book01pic, 200, 200);
            Item12.setPlainPrimaryText('十 二 文');
            Item12.setPlainSecondaryText('跟读 0 测试 0');


            let Item13 = new ListTemplateItem();
            Item13.setToken('chapter0103');
            Item13.setImage(book01pic, 200, 200);
            Item13.setPlainPrimaryText('十 三 元');
            Item13.setPlainSecondaryText('跟读 0 测试 0');


            let Item14 = new ListTemplateItem();
            Item14.setToken('chapter0103');
            Item14.setImage(book01pic, 200, 200);
            Item14.setPlainPrimaryText('十 四 寒');
            Item14.setPlainSecondaryText('跟读 0 测试 0');


            let Item15 = new ListTemplateItem();
            Item15.setToken('chapter0103');
            Item15.setImage(book01pic, 200, 200);
            Item15.setPlainPrimaryText('十 五 删');
            Item15.setPlainSecondaryText('跟读 0 测试 0');


            listTemplate.addItem(Item1);
            listTemplate.addItem(Item2);
            listTemplate.addItem(Item3);
            listTemplate.addItem(Item4);
            listTemplate.addItem(Item5);
            listTemplate.addItem(Item6);
            listTemplate.addItem(Item7);
            listTemplate.addItem(Item8);
            listTemplate.addItem(Item9);
            listTemplate.addItem(Item10);
            listTemplate.addItem(Item11);
            listTemplate.addItem(Item12);
            listTemplate.addItem(Item13);
            listTemplate.addItem(Item14);
            listTemplate.addItem(Item15);
            let directive = new RenderTemplate(listTemplate);
            return {
                directives: ['PushStack',directive],
                outputSpeech: '请您选择章节'
            };
        }
        let questionsList = '';
        if (token=='chapter0101'){
            questionsList = book01.chapter01;  }
        if (token=='chapter0102'){
            questionsList = book01.chapter02;  }
        if (token=='chapter0103'){
            questionsList = book01.chapter03;  }
        if (token=='chapter0104'){
            questionsList = book01.chapter04;  }
        if (token=='chapter0105'){
            questionsList = book01.chapter05;  }
        if (token=='chapter0106'){
            questionsList = book01.chapter06;  }
        if (token=='chapter0107'){
            questionsList = book01.chapter07;  }
        if (token=='chapter0108'){
            questionsList = book01.chapter08;  }
        if (token=='chapter0109'){
            questionsList = book01.chapter09;  }
        if (token=='chapter0110'){
            questionsList = book01.chapter10;  }
        if (token=='chapter0111'){
            questionsList = book01.chapter11;  }
        if (token=='chapter0112'){
            questionsList = book01.chapter12;  }
        if (token=='chapter0113'){
            questionsList = book01.chapter13;  }
        if (token=='chapter0114'){
            questionsList = book01.chapter14;  }
        if (token=='chapter0115'){
            questionsList = book01.chapter15;  }

        this.setSessionAttribute('currentQuestionIndex',0); 
        this.setSessionAttribute('questionsList',questionsList); 
        this.setSessionAttribute('score',0); 

        let card = new Bot.Card.TextCard('准备好了就请说开始学习');
        return {
            card: card,
            outputSpeech: '准备好了就请说开始学习'
        };

    }



    getTemplate1(title,text,bkg) {
    	console.log(text);
        let bodyTemplate = new Bot.Directive.Display.Template.BodyTemplate1();
        bodyTemplate.setPlainTextContent(text,-1);
	    bodyTemplate.setToken('token');
	    bodyTemplate.setBackGroundImage(bkg);
	    bodyTemplate.setTitle(title);
        let renderTemplate = new Bot.Directive.Display.RenderTemplate(bodyTemplate);
        return renderTemplate;
    }


    sessionEndedRequest() {
        console.log("session end ");
        this.endDialog();
        return {
            outputSpeech: '多谢使用!'
        };
    }


    //重新开始答题，得分清零
    newGame()  {
        this.waitAnswer();
        //初始化一轮中的问题列表和第一题的话术
        this.startNewGame().then((value)=>
        {       console.log(value);
                repromptText=value;}
       );

        return {
              directives: [this.getTemplate1(titleStr,repromptText,defaultBkg)],
            outputSpeech: '好的，重新开始。' + repromptText
        };
    }



   /**
     * 学习模式
     *
     * @return {Object}
     */
    learnIntent() {
        this.waitAnswer();
        let learnmode='';
        let questionsList= this.getSessionAttribute('questionsList');
        let currentQuestionIndex= this.getSessionAttribute('currentQuestionIndex');
        learnmode= this.getSessionAttribute('learnmode');

        if (currentQuestionIndex=questionsList.length()){
            currentQuestionIndex=0;
        }

        console.log('current index ',currentQuestionIndex);

        if (currentQuestionIndex==null){
            let listTemplate = new ListTemplate1();
            listTemplate.setToken('token00');
            listTemplate.setBackGroundImage(bkpic);
            listTemplate.setTitle(titleStr);

            //设置模版列表数组listItems其中一项，即列表的一个元素
            let Item1 = new ListTemplateItem();
            Item1.setToken('book01');
            Item1.setImage(book01pic, 200, 200);
            Item1.setPlainPrimaryText(book01Str);
            Item1.setPlainSecondaryText('跟读0 背诵0');

            listTemplate.addItem(Item1);
            //定义RenderTemplate指令
            let directive = new RenderTemplate(listTemplate);
            return {
                directives: [directive],
                outputSpeech: '请您先选择书籍'
            };   
        }

        console.log('learnmode mode',learnmode);

        if (!learnmode){
            learnmode = this.getSlot('learnmode');
            this.setSessionAttribute('learnmode',learnmode);
        }
         
	    var CurrQuestion=Object.values(questionsList[currentQuestionIndex])[0][0];
    	if (currentQuestionIndex>0){
         	CurrQuestion=Object.values(questionsList[currentQuestionIndex-1])[0][0];
      	}
        let Answer = this.getSlot('theAnswer');
        
	   console.log(' Answer is,CurrQuestion is ,learnmode',Answer,CurrQuestion,learnmode)

        //学习模式，直接朗读
        if (learnmode=='learn'||Answer=='过')
        {
            
            currentQuestionIndex=currentQuestionIndex+1;

            console.log('learn mode output',currentQuestionIndex, Object.values(questionsList[currentQuestionIndex-1])[0][0]);
            this.setSessionAttribute('currentQuestionIndex',currentQuestionIndex);
            return ({
                directives: [this.getTemplate1(titleStr, Object.values(questionsList[currentQuestionIndex-1])[0][0],bkpic)],
                outputSpeech: Object.values(questionsList[currentQuestionIndex-1])[0][0]
            })

        }

        if ((Answer==CurrQuestion)&&(learnmode=='follow'))
        {
            currentQuestionIndex=currentQuestionIndex+1;
            console.log('currentQuestionIndex',currentQuestionIndex);
            return ({
            directives: [this.getTemplate1(titleStr, Object.values(questionsList[currentQuestionIndex-1])[0][0],bkpic)],
            outputSpeech: '请跟读'
            })
        }
    }


    CommonIntent() {
        this.waitAnswer();  
        console.log(this.request.getQuery());      
        let speech = this.request.getQuery();
        let reprompt = this.request.getQuery();

        return {
          //  outputSpeech: speech,
            reprompt: reprompt,
        };
    }
}


module.exports = GuoxueBot;
