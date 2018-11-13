 /**
  * @file js-sdk bot demo
  * @author yelvye@baidu.com
  */
 
const defaultBkg = 'https://tac-hyreading-st-1256361653.cos.ap-shanghai.myqcloud.com/timg.jpg';
const titleStr = '国学闯关';

const Bot = require('bot-sdk');
let ConnUtils = require('./tools/ConnUtils');
const privateKey = require("./rsaKeys.js").privateKey;



const RenderTemplate = Bot.Directive.Display.RenderTemplate;
const ListTemplate1 =Bot.Directive.Display.Template.ListTemplate1;
const ListTemplateItem = Bot.Directive.Display.Template.ListTemplateItem;

//定义一轮问答中的问题数量
const GAME_LENGTH = 10;
//定义每个问题的答案数量
const ANSWER_COUNT = 4;


class InquiryBot extends Bot {


    genToken(token) {
        let buffer = new Buffer(token.toString());
        return buffer.toString('base64');
    } 

   constructor(postData) {
        super(postData);
        this.addLaunchHandler(this.launch);
        this.addSessionEndedHandler(this.sessionEndedRequest);

        this.addEventListener('Display.ElementSelected', function(event) {
            let token = event.token;
            console.log('console log token',token)
            let listTemplate = new ListTemplate1();
            //设置模板token
            listTemplate.setToken('token');
            //设置模板背景图
            listTemplate.setBackGroundImage('https://skillstore.cdn.bcebos.com/icon/100/c709eed1-c07a-be4a-b242-0b0d8b777041.jpg');
            //设置模版标题
            listTemplate.setTitle('笠翁对韵');

            //设置模版列表数组listItems其中一项，即列表的一个元素
            let Item1 = new ListTemplateItem();
            Item1.setToken('token');
            Item1.setImage('https://skillstore.cdn.bcebos.com/icon/100/c709eed1-c07a-be4a-b242-0b0d8b777041.jpg');
            //or 图片设置宽和高
            Item1.setImage('https://skillstore.cdn.bcebos.com/icon/100/c709eed1-c07a-be4a-b242-0b0d8b777041.jpg', 200, 200);
            Item1.setPlainPrimaryText('东一');
            Item1.setPlainSecondaryText('东一');

            let Item2 = new ListTemplateItem();
            Item2.setToken('token');
            Item2.setImage('https://skillstore.cdn.bcebos.com/icon/100/c709eed1-c07a-be4a-b242-0b0d8b777041.jpg');
            //or 图片设置宽和高
            Item2.setImage('https://skillstore.cdn.bcebos.com/icon/100/c709eed1-c07a-be4a-b242-0b0d8b777041.jpg', 200, 200);
            Item2.setPlainPrimaryText('夏二');
            Item2.setPlainSecondaryText('夏二');


            //把listTemplateItem添加到模版listItems
            listTemplate.addItem(Item1);
            listTemplate.addItem(Item2);
            //定义RenderTemplate指令
            let directive = new RenderTemplate(listTemplate);
            return {
                directives: [directive],
                outputSpeech: '请您选择章节'
            };
        });
        

        //学习模式
        this.addIntentHandler('learn_intent', this.learnIntent);
        //跟读模式
        this.addIntentHandler('follow_intent', this.followIntent);
        //测试模式
        this.addIntentHandler('answer_intent', this.AnswerIntent);
        //重新开始
        this.addIntentHandler('newGame_intent', this.newGame);
        //默认意图
        this.addIntentHandler('ai.dueros.common.default_intent', this.CommonIntent);
        
        this.addDefaultEventListener(this.defaultEvent);
    }




    launch() {
        this.waitAnswer();

        let listTemplate = new ListTemplate1();
        //设置模板token
        listTemplate.setToken('token');
        //设置模板背景图
        listTemplate.setBackGroundImage('https://skillstore.cdn.bcebos.com/icon/100/c709eed1-c07a-be4a-b242-0b0d8b777041.jpg');
        //设置模版标题
        listTemplate.setTitle('国学经典');

        //设置模版列表数组listItems其中一项，即列表的一个元素
        let Item1 = new ListTemplateItem();
        Item1.setToken('token');
        Item1.setImage('https://skillstore.cdn.bcebos.com/icon/100/c709eed1-c07a-be4a-b242-0b0d8b777041.jpg');
        //or 图片设置宽和高
        Item1.setImage('https://skillstore.cdn.bcebos.com/icon/100/c709eed1-c07a-be4a-b242-0b0d8b777041.jpg', 200, 200);
        Item1.setPlainPrimaryText('笠翁对韵');
        Item1.setPlainSecondaryText('国学经典启蒙');

        let Item2 = new ListTemplateItem();
        Item2.setToken('token');
        Item2.setImage('https://skillstore.cdn.bcebos.com/icon/100/c709eed1-c07a-be4a-b242-0b0d8b777041.jpg');
        //or 图片设置宽和高
        Item2.setImage('https://skillstore.cdn.bcebos.com/icon/100/c709eed1-c07a-be4a-b242-0b0d8b777041.jpg', 200, 200);
        Item2.setPlainPrimaryText('论语');
        Item2.setPlainSecondaryText('儒家启蒙');


        //把listTemplateItem添加到模版listItems
        listTemplate.addItem(Item1);
        listTemplate.addItem(Item2);
        //定义RenderTemplate指令
        let directive = new RenderTemplate(listTemplate);
        return {
            directives: [directive],
            outputSpeech: '请您先选择书籍'
        };


    }




    startNewGamePromise(promiseUser,promiseQuestion){
        return Promise.all([promiseUser,promiseQuestion])
        .then(values=>{
             return values;
        })
    }


    getUser(userid){
        //先提前判断该用户是否登录过，如没有，增加登录记录。 如有，存取历史记录。
        let self=this;
        return new Promise(function (resolve, reject) {
            let query_str ="SELECT score " +
                        "FROM hy_users " +
                        "WHERE (userid = ?) " +
                        "LIMIT 1 ";
            let query_var=userid;
            let mysql_conn = ConnUtils.get_mysql_client();
            mysql_conn.query(query_str,query_var,function (error, results, fields) {
                if (!error && typeof(results) != "undefined" && results.length > 0){

                    //如有存取记录，获取属性。
                    let gamescore=results[0].score;
                    self.setSessionAttribute('GameScore',gamescore);
                    resolve('OK1');
                }else{
                    //增加用户账号
                    var addSql = 'INSERT INTO hy_users (userid) VALUES(?)';
                    var addSqlParams = userid;

                    mysql_conn.query(addSql,addSqlParams, function(err, results, fields) {
                                 if (err) {
                                          console.log(err);

                                  }else{
                                          console.log(results);
                                          resolve('OK2');
                                   }
                    })
                    resolve('OK3');
                }
            });
        });
    }
    
    getQuestion() {
        let self=this;
        return new Promise(function (resolve, reject) {
            var questions=[]; 
            let query_str ="SELECT id,ll,lr,lr1,lr2,lr3,chapter  FROM book_lwdy_sel  WHERE "+
                "id >= (SELECT floor(RAND() * (SELECT MAX(id) FROM book_lwdy_sel))) ORDER BY id LIMIT 0,?";
            let query_var=GAME_LENGTH;
            let mysql_conn = ConnUtils.get_mysql_client();
            mysql_conn.query(query_str,query_var,function (error, results, fields) {
                if (!error){
                    console.log('begin query question');
                    for(var i = 0; i < results.length; i++)
                    {

                        var key=results[i].ll;
                        var obj={};
                        obj[key]=[results[i].lr,results[i].lr1,results[i].lr2,results[i].lr3];
                        //obj[key]=keys[1];
                        questions.push(obj);

                    }

                    
                    let questionsList=questions;
                    let gameQuestions = self.populateGameQuestions(questionsList);
                    let correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
                    //console.log(correctAnswerIndex);
                    let roundAnswers = self.populateRoundAnswers(gameQuestions, 0,correctAnswerIndex,questionsList);
                    let currentQuestionIndex = 0;
                    let spokenQuestion = Object.keys(questionsList[gameQuestions[currentQuestionIndex]])[0];
                    let repromptText = '第1题 ' + spokenQuestion + '\n';
                    for (let i = 0; i < ANSWER_COUNT; i += 1) {
                        repromptText += ` ${i + 1}.  ${roundAnswers[i]} `;
                    }
                
                    let currentQuestion = questionsList[gameQuestions[currentQuestionIndex]];
                    self.setSessionAttribute('currentQuestionIndex',currentQuestionIndex);
                    self.setSessionAttribute('correctAnswerIndex',correctAnswerIndex + 1);
                    self.setSessionAttribute('gameQuestions',gameQuestions);
                    self.setSessionAttribute('questionsList',questionsList);
                    self.setSessionAttribute('score',0);
                    self.setSessionAttribute('correctAnswerText',currentQuestion[Object.keys(currentQuestion)[0]][0]);
                    resolve(repromptText);

                }else{
                    reject(error);
 
                }
            });
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
        let chapter = this.getSlot('chapter');
	console.log('chapter',chapter)

        if (typeof(chapter)==undefined) {
            console.log('ask chapter'); 
	    //this.nlu.ask('chapter');
            //  如果有异步操作，可以返回一个promise
            return new Promise(function (resolve, reject) {
                resolve({
                    directives: [this.getTemplate1(titleStr,'请选择章节',defaultBkg)],
                    outputSpeech: '请选择章节，比如上卷第一章'
                });
            });
        }
        if(typeof(contentList)==undefined){
            return new Promise(function (resolve, reject) {
            var questions=[]; 
            let query_str ="SELECT content  FROM book_lwdy_sel  WHERE "+
                "locate(?,chapter)>0";
            let query_var=GAME_LENGTH;
            let mysql_conn = ConnUtils.get_mysql_client();
            mysql_conn.query(query_str,query_var,function (error, results, fields) {
                if (!error){
                    console.log('begin query chapter');
                    for(var i = 0; i < results.length; i++)
                    {
                        var key=results[i].content;
                        contentList.push(key);
                    }
                    this.SetSessionAttribute('contentList',contentList);
                    this.SetSessionAttribute('contentListSeq',0);
                    resolve(contentList);
                }else{
                    reject(error);
                }
            });
            });   
        }
        let contentList= this.getSessionAttribute('contentList');
        let contentListSeq= this.getSessionAttribute('contentListSeq');
        console.log(contentList[contentListSeq]);
        if (contentListSeq==contentList.length){
            this.SetSessionAttribute('contentListSeq',contentList.length);
        }

        return ({
            directives: [this.getTemplate1(titleStr,contentList[contentListSeq],defaultBkg)],
            outputSpeech: contentList[contentListSeq]
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


module.exports = InquiryBot;
