 /**
  * @file js-sdk bot demo
  * @author yelvye@baidu.com
  */
const Bot = require('bot-sdk');
let ConnUtils = require('./tools/ConnUtils');
const privateKey = require("./rsaKeys.js").privateKey;
//const questions = require('./questions');
var Q=require('q');
var defer=Q.defer();

//定义一轮问答中的问题数量
const GAME_LENGTH = 10;
//定义每个问题的答案数量
const ANSWER_COUNT = 3;


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
        this.addIntentHandler('answer_intent', this.AnswerIntent);
        this.addIntentHandler('newGame_intent', this.newGame);
        this.addIntentHandler('ai.dueros.common.default_intent', this.CommonIntent);
        this.addDefaultEventListener(this.defaultEvent);
    }




    launch() {
        this.waitAnswer();
        let self=this;
        let userid=this.request.getUserId();

 
    function  getList(){
        var questions=[];
        let query_str ="SELECT id,content FROM lwdy WHERE "+
                "id >= (SELECT floor(RAND() * (SELECT MAX(id) FROM lwdy))) ORDER BY id LIMIT 0,?";
        let query_var=GAME_LENGTH;

        return new Promise(function(resolve, reject) {
            let mysql_conn = ConnUtils.get_mysql_client();
                mysql_conn.query(query_str,query_var,function (error, results, fields) {
                if(error){
                    reject(error)
                }else{
                    for(var i = 0; i < results.length; i++)
                    {
                        console.log("%d\t%s\t", results[i].id, results[i].content);
                        var key=results[i].content;
                        var obj={};
                        obj[key]=['a','b','c'];
                        questions.push(obj);
                    }
                resolve(questions);
                }
            });
        });
    }


    function getUser(userid){
        console.log('getuser');
        let query_str ="SELECT username " +
                    "FROM hy_users " +
                    "WHERE (userid = ?) " +
                    "LIMIT 1 ";
        let query_var=userid;
        
        return new Promise(function(resolve,reject){
            let mysql_conn = ConnUtils.get_mysql_client();
            mysql_conn.query(query_str,query_var,function (error, results, fields) {
                if(!error){
                    resolve(results[0].username);
                }else{
                    reject(error)
                }
            });
        });
    }


    function setQuestionsList(questions)
    {
        console.log(questions);
        let questionsList=questions;
        let gameQuestions = self.populateGameQuestions(questionsList);
        let correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
        console.log(correctAnswerIndex);
        let roundAnswers = self.populateRoundAnswers(gameQuestions, 0,correctAnswerIndex,questionsList);
        let currentQuestionIndex = 0;
        let spokenQuestion = Object.keys(questionsList[gameQuestions[currentQuestionIndex]])[0];
        let repromptText = '第1题：\n' + spokenQuestion + '\n';
        for (let i = 0; i < ANSWER_COUNT; i += 1) {
            repromptText += `${i + 1}. ${roundAnswers[i]}. `;
        }
    
        let currentQuestion = questionsList[gameQuestions[currentQuestionIndex]];
        self.setSessionAttribute('currentQuestionIndex',currentQuestionIndex);
        self.setSessionAttribute('correctAnswerIndex',correctAnswerIndex + 1);
        self.setSessionAttribute('gameQuestions',gameQuestions);
        self.setSessionAttribute('questionsList',questionsList);
        self.setSessionAttribute('score',0);
        self.setSessionAttribute('correctAnswerText',currentQuestion[Object.keys(currentQuestion)[0]][0]);
       return repromptText;
    }


       var repromptText='';    
       getList()
	   .then(function (results) {
	       repromptText=setQuestionsList(results);	
	console.log(repromptText);
        });
       getUser(userid)
       .then(function(value){
           console.log(repromptText);
	   let card=new Bot.Card.TextCard(repromptText);
           let speechOutput = '欢迎你' + value + '我们将从笠翁对韵中随机抽取十句，要求你根据上句选择下句。';
           console.log(speechOutput);
           return {
                card: card,
                outputSpeech: speechOutput + repromptText
            };
	});

    }



  /**
     *  从问题列表中随机抽取问题。问题个数由变量GAME_LENGTH定义
     *  @param {list} translatedQuestions 所有问题列表
     *  @return 问题id列表
     */
    populateGameQuestions(translatedQuestions) {
        let gameQuestions = [];
        let indexList = [];
        let index = translatedQuestions.length;
        if (GAME_LENGTH > index) {
            throw new Error('Invalid Game Length.');
        }

        for (let i = 0; i < translatedQuestions.length; i += 1) {
            indexList.push(i);
        }

        for (let j = 0; j < GAME_LENGTH; j += 1) {
            let rand = Math.floor(Math.random() * index);
            index -= 1;

            let temp = indexList[index];
            indexList[index] = indexList[rand];
            indexList[rand] = temp;
            gameQuestions.push(indexList[index]);
        }
        return gameQuestions;
    }

  /**
     *  从问题列表中随机抽取问题。问题个数由变量GAME_LENGTH定义
     *  @param {list} gameQuestionIndexes 一轮问答中问题id列表
     *  @param {int} currentQuestionIndex 当前问题Index
     *  @param {int} correctAnswerTargetLocation 当前问题答案Index
     *  @param {list} translatedQuestions 所有问题列表
     *  @return 当前问题答案选项列表
     */
    populateRoundAnswers(gameQuestionIndexes,currentQuestionIndex,correctAnswerTargetLocation,translatedQuestions) {
        const answers = [];
        const translatedQuestion = translatedQuestions[gameQuestionIndexes[currentQuestionIndex]];
        const answersCopy = translatedQuestion[Object.keys(translatedQuestion)[0]].slice();
	    let index = answersCopy.length;

        if (index < ANSWER_COUNT) {
            throw new Error('Not enough answers for question.');
        }

          // 打乱当前问题答案列表顺序
        for (let j = 1; j < answersCopy.length; j += 1) {
            const rand = Math.floor(Math.random() * (index - 1)) + 1;
            index -= 1;

            const swapTemp1 = answersCopy[index];
            answersCopy[index] = answersCopy[rand];
            answersCopy[rand] = swapTemp1;
        }

          // 将正确答案放置到correctAnswerTargetLocation的位置
        for (let i = 0; i < ANSWER_COUNT; i += 1) {
            answers[i] = answersCopy[i];
        }
        const swapTemp2 = answers[0];
        answers[0] = answers[correctAnswerTargetLocation];
        answers[correctAnswerTargetLocation] = swapTemp2;
        return answers;
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
    AnswerIntent() {
        this.waitAnswer();
        let theAnswer = this.getSlot('theAnswer');
        if (!theAnswer) {
            this.nlu.ask('theAnswer');
            return {
                outputSpeech: '您的答案是哪个？'
            };
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
            speechOutput += '已经是最后一题了。您可以说重新开始来继续答题，或者说退出来退出技能。'
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
        let repromptText = '第' + questionIndexForSpeech + '题：\n' + spokenQuestion + '\n';
        for (let i = 0; i < ANSWER_COUNT; i += 1) {
            repromptText += `${i + 1}. ${roundAnswers[i]}. `;
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
        return {
            card: card,
            outputSpeech: speechOutput
        };
    }


    //重新开始答题，得分清零
    newGame()  {
        this.waitAnswer();
        //初始化一轮中的问题列表和第一题的话术
        let repromptText =  this.startNewGame();
        let card = new Bot.Card.TextCard(repromptText);
        return {
            card: card,
            outputSpeech: '好的，重新开始。' + repromptText
        };
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
