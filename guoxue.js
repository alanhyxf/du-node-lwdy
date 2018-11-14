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
        //跟读模式
      
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
            Item1.setPlainPrimaryText('东一');
            Item1.setPlainSecondaryText('东一');

            let Item2 = new ListTemplateItem();
            Item2.setToken('chapter0102');
            Item2.setImage(book01pic, 200, 200);
            Item2.setPlainPrimaryText('夏二');
            Item2.setPlainSecondaryText('夏二');
            listTemplate.addItem(Item1);
            listTemplate.addItem(Item2);
            let directive = new RenderTemplate(listTemplate);
            //let directive1 = new PushStack('PushStack');
            return {
                directives: [PushStack,directive],
                outputSpeech: '请您选择章节'
            };
        }

        if (token=='chapter0101'){
            let questionsList = book01.chapter01;
            
            this.setSessionAttribute('currentQuestionIndex',1); 
            this.setSessionAttribute('questionsList',questionsList); 
            this.setSessionAttribute('score',0); 
          //  console.log('get list',questionsList);
          //  console.log('get list ', Object.values(questionsList[0])[0][1]); 
         //  console.log('get list index',Object.values(questionsList[])[0][1]);  
            let card = new Bot.Card.TextCard('准备好了就请说开始学习 开始跟读或者开始测试');
             return {
                card: card,
                outputSpeech: '准备好了就请说开始学习 开始跟读或者开始测试'
            };

        }
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



   /**
     * 
     *
     * @return {Object}
     */
    AnswerIntent() {
        this.waitAnswer();
        let theAnswer = this.getSlot('theAnswer');

        

        let self=this;
        let userid=this.request.getUserId();
        if (!theAnswer) {	
        return this.startNewGamePromise(this.getUser(userid),this.getQuestion()).
        then(
            data=>{
                   let speechOutput = '我将念上句，请你按照选项回答下句。';
           	   let repromptText = data[1];
                   console.log('username,repromptText',data[0],data[1]);
                   //let card = new Bot.Card.TextCard(repromptText);
                   return Promise.resolve({
            directives: [this.getTemplate1(titleStr,repromptText,defaultBkg)],                    
            outputSpeech: speechOutput +  repromptText
                   });
        }
            ).catch(data=>{return {directives:[this.getTemplate1('Error','系统错误:1000',defautlBkg)]}});
         }


        //获取session中相关信息
        let questionsList = this.getSessionAttribute('questionsList');
        let score = this.getSessionAttribute('score');
        let currentQuestionIndex = this.getSessionAttribute('currentQuestionIndex');
        let correctAnswerIndex = this.getSessionAttribute('correctAnswerIndex');
        let gameQuestions = this.getSessionAttribute('gameQuestions');
        let correctAnswerText = this.getSessionAttribute('correctAnswerText');
        let speechOutput = '';

        if (theAnswer == correctAnswerIndex){
            score += 1;
            speechOutput = '回答正确。目前正确：' + score + '题。';
        }else{
            speechOutput = '很遗憾，回答错误。正确答案是' + correctAnswerText + '.目前正确：' + score + '题。';
        }

        if (currentQuestionIndex == GAME_LENGTH - 1){
         //   speechOutput += '已经是最后一题了。您可以说重新开始来继续答题，或者说退出来退出技能。' 
            if (score<5)
            {
                speechOutput += '您答对题目数量不多，要名落孙山了。您可以重新开始来继续答题，或者说退出来退出技能。'
            } 
            else if (score==5 || score==6)
            {
                speechOutput += '您获得秀才称号。您可以重新开始来继续答题，或者说退出来退出技能。'
            } 
            else if (score==7 || score==8)
            {
                speechOutput += '您获得举人称号。您可以重新开始来继续答题，或者说退出来退出技能。'
            } 
            else if (score==9)
            {
                speechOutput += '您获得进士称号。您可以重新开始来继续答题，或者说退出来退出技能。'
            } 
            else if (score==10)
            {
                speechOutput += '恭喜，您获得状元称号。您可以重新开始来继续答题，或者说退出来退出技能。'
            } 

            return {
                outputSpeech: speechOutput
            };
        }
            //获取下一题信息
        currentQuestionIndex += 1;
        correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
        let spokenQuestion = Object.keys(questionsList[gameQuestions[currentQuestionIndex]])[0];
        let roundAnswers = this.populateRoundAnswers(gameQuestions, currentQuestionIndex,correctAnswerIndex,questionsList);
        let questionIndexForSpeech = currentQuestionIndex + 1;
        let repromptText = '第' + questionIndexForSpeech + '题 ' + spokenQuestion + '\n';
        for (let i = 0; i < ANSWER_COUNT; i += 1) {
            repromptText += `${i + 1}.  ${roundAnswers[i]} `;
        }
        speechOutput += repromptText;
        let currentQuestion = questionsList[gameQuestions[currentQuestionIndex]];
        this.setSessionAttribute('speechOutput',speechOutput);
        this.setSessionAttribute('currentQuestionIndex',currentQuestionIndex);
        this.setSessionAttribute('correctAnswerIndex',correctAnswerIndex + 1);
        this.setSessionAttribute('gameQuestions',gameQuestions);
        this.setSessionAttribute('questionsList',questionsList);
        this.setSessionAttribute('score',score);
        this.setSessionAttribute('correctAnswerText',currentQuestion[Object.keys(currentQuestion)[0]][0]);
        let card = new Bot.Card.TextCard(repromptText);
        console.log(repromptText)
        return {
             directives: [this.getTemplate1(titleStr,repromptText,defaultBkg)],
            outputSpeech: speechOutput
        };
    }


    //重新开始答题，得分清零
    newGame()  {
        this.waitAnswer();
        //初始化一轮中的问题列表和第一题的话术
 

        this.startNewGame().then((value)=>
        {      console.log(value);
             repromptText=value;}
       );

      // let card = new Bot.Card.TextCard(repromptText);
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


        let questionsList= this.getSessionAttribute('questionsList');
        let currentQuestionIndex= this.getSessionAttribute('currentQuestionIndex');
        let CurrQuestion=Object.values(questionsList[currentQuestionIndex])[0][0];
        console.log(currentQuestionIndex);

        if (!currentQuestionIndex){
                let listTemplate = new ListTemplate1();
                //设置模板token
                listTemplate.setToken('token00');
                listTemplate.setBackGroundImage(bkpic);
                listTemplate.setTitle(titleStr);

                //设置模版列表数组listItems其中一项，即列表的一个元素
                let Item1 = new ListTemplateItem();
                Item1.setToken('book01');
                Item1.setImage(book01pic, 200, 200);
                Item1.setPlainPrimaryText(book01Str);
                Item1.setPlainSecondaryText('跟读0 背诵0');

                let Item2 = new ListTemplateItem();
                Item2.setToken('book02');
                Item2.setImage(book02pic, 200, 200);
                Item2.setPlainPrimaryText('论语');
                Item2.setPlainSecondaryText('跟读0 背诵0');

                listTemplate.addItem(Item1);
                listTemplate.addItem(Item2);
                //定义RenderTemplate指令
                let directive = new RenderTemplate(listTemplate);
                return {
                    directives: [directive],
                    outputSpeech: '请您先选择书籍'
                };   
        }


       let mode = this.getSlot('learnmode');
	   console.log('mode ',mode)
        if (!mode){
            this.nlu.ask('learnmode'); 
            return { 
                outputSpeech: '您要选择哪个模式' 
            }; 

        }
        
        let Answer = this.getSlot('theAnswer');
        if (Answer==CurrQuestion)
        {

            currentQuestionIndex=currentQuestionIndex+1;
        }

        return ({
            directives: [this.getTemplate1(titleStr, Object.values(questionsList[currentQuestionIndex])[0][0],bkpic)],
            outputSpeech: '请跟读'
        })

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
