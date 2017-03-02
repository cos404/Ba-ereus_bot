var TelegramBot = require('node-telegram-bot-api');
var config = require('./config.js')
var bot = new TelegramBot(config.telegram_api_key, {polling: true});
var fs = require("fs")

var usersHASH = JSON.parse(fs.readFileSync('users.json', 'utf8'));

bot.getMe().then((me) => {
    console.log('Hello! My name is %s!', me.first_name);
    console.log('My id is %s.', me.id);
    console.log('And my username is @%s.', me.username);
});


bot.onText(/\/regme/, (msg, match) => {
	var userRole;
	var userRep;
	var chatId = msg.chat.id;
	var userId = msg.from.id;
	var userName = msg.from.username;


	randomVar = Math.floor((Math.random() * 10) + 1);
	
	// CHECK AND ADD USER TO JSON
	if(usersHASH[chatId] == undefined){
		usersHASH[chatId] = {};
	}
	else console.log("Chat found!");

	if(usersHASH[chatId][userId] == undefined && userId != chatId){

		switch(true) {
		case randomVar <= 5: 
			userRole = "Shut";
			userRep = -100;
			bot.sendMessage(chatId, "Поздравляю! Ты неудачник! И твое звание: " + userRole + ", а также поздравляю тебя с тем, что твоя репутация равна:" + userRep);
		break;
		case randomVar > 5: 
			userRole = "Czar";
			userRep = 100;
			bot.sendMessage(chatId, "Поздравляю! Оказывается ты везунчик! Твое звание: " + userRole + ", а также поздравляю тебя с тем, что твоя репутация равна:" + userRep + ". Советую сегодня сыграть тебе в лоторею! Сегодня явно твой день.");
		break;
	}

		// SEND DATE TO ARRAY
		usersHASH[chatId][userId] = {'uid':userId, 'uName':"@" + userName, 'rang':userRole, 'reputation':userRep}
	}
	else if(userId == chatId) bot.sendMessage(chatId, "Получить звание можно только в публичной группе!");
	else bot.sendMessage(chatId, "Ты уже получил звание!");

	usersJSON = JSON.stringify(usersHASH, null,	'\t');
	fs.writeFileSync('users.json', usersJSON);
});

	// /up @cosmos404 10
bot.onText(/\/up (.+) (.+)/, (msg, match) => {

	var chatId = msg.chat.id;
	var userId = msg.from.id;
	var userName = msg.from.username;
	var repUpName = match[1];
	var repUp = parseInt(match[2]);
	var transferConfirm = false;

	if(usersHASH[chatId] != undefined && usersHASH[chatId][userId] != undefined && usersHASH[chatId][userId].reputation >= repUp){
		
		for(var i in usersHASH[chatId]) {
			for(var j in usersHASH[chatId][i]){
				if(usersHASH[chatId][i].uName == repUpName){
			 		usersHASH[chatId][i].reputation += repUp;
			 		usersHASH[chatId][userId].reputation -= repUp;
			 		transferConfirm = true;
			 		bot.sendMessage(chatId, "Поздравляю! Вы передали: " + repUp + ", пользователю: " + repUpName + ". Теперь ваша репутация равна: " + usersHASH[chatId][userId].reputation + ".");
			 		break;
			 	}
			}
		}
		if(!transferConfirm) bot.sendMessage(chatId, "Пользователь, которому вы хотите передать репутацию не зарегистрирован!");
	}
	else if(usersHASH[chatId] == undefined || usersHASH[chatId][userId] == undefined)
	{
		bot.sendMessage(chatId, "Вы не зарегистрированы! Для регистрации отправьте: /regme");
	}
	else if(usersHASH[chatId][userId].reputation < repUp){
		bot.sendMessage(chatId, "Ваша репутация должна быть выше, чем та которой вы хотите поделиться! Ваша репутация равна: " + usersHASH[chatId][userId].reputation + ".");
	}
	else bot.sendMessage(chatId, "Я не знаю что, но что-то пошло не так!");

	usersJSON = JSON.stringify(usersHASH, null,	'\t');
	fs.writeFileSync('users.json', usersJSON);
});


bot.onText(/\/rang/, (msg, match) => {
	var chatId = msg.chat.id;
	var userId = msg.from.id;
	var userName = msg.from.username;
		if(usersHASH[chatId] != undefined && usersHASH[chatId][userId] != undefined) {
			bot.sendMessage(chatId, "Твой ранг: " + usersHASH[chatId][userId].rang + ", а также у тебя: " + usersHASH[chatId][userId].reputation + " репутации.");
		}
		else bot.sendMessage(chatId, "Вы не зарегистрированы. Отправьте /regme для регистрации!");
});

bot.onText(/\/log/, (msg, match) => {
	var userId = msg.from.id;
	var userName = msg.from.username;
	var chatId = msg.chat.id;
	console.log("0. UID: " + userId + ". Chat ID: " + chatId);
    console.log(usersHASH[chatId]);
});

bot.on('message', (msg) => {
	var chatId = msg.chat.id;
	var userId = msg.from.id;
	var msg = msg.text;
	var msgText =  msg.split(' ')[0]; 
	if(msgText != "/rang" && msgText != "/up" && msgText != "/reg" && msgText != "/regme" && msgText != "/log"){
		if(msg.split(' ').length > 10 && msg.trim().length > 25){
			usersHASH[chatId][userId].reputation += 3;
		}
		else if(msg.split(' ').length <= 4 && msg.trim().length <= 10) usersHASH[chatId][userId].reputation -= 1;
		
		sersJSON = JSON.stringify(usersHASH, null,	'\t');
		fs.writeFileSync('users.json', usersJSON);
	}
});