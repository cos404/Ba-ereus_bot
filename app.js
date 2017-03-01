var TelegramBot = require('node-telegram-bot-api');
var token = '324534697:AAFSKI9XahVAY-vQGoWlaLRZw0a4lyLo82A';
var bot = new TelegramBot(token, {polling: true});
var fs = require("fs")

// .parse - convert JSON to JS code
var usersHASH = JSON.parse(fs.readFileSync('users.json', 'utf8'));

bot.getMe().then(function(me)
{
    console.log('Hello! My name is %s!', me.first_name);
    console.log('My id is %s.', me.id);
    console.log('And my username is @%s.', me.username);
});


bot.onText(/\/regme/, function (msg, match) {
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
		usersHASH[chatId][userId] = {'uid':userId, 'rang':userRole, 'reputation':userRep}
	}
	else if(userId == chatId) bot.sendMessage(chatId, "Получить звание можно только в публичной группе!");
	else bot.sendMessage(chatId, "Ты уже получил звание!");

	// .stringify - convert JS cpde to JSON (hash, replace, formatting)
	usersJSON = JSON.stringify(usersHASH, null,	'\t');
	// SAVE DATA IN JSON
	fs.writeFileSync('users.json', usersJSON);
});

bot.onText(/\/repup (.+) (.+)/, function (msg, match) {
	// \/repup @cosmos404 10
	var chatId = msg.chat.id;
	var userId = msg.from.id;
	var userName = msg.from.username;

	var repUpName = match[1];
	var repUp = match[2];

	if(usersHASH[chatId][userId] != undefined && usersHASH[chatId][userId].reputation >= repUp){
		usersHASH[chatId][userId].reputation -= repUp
		console.log("Кому: " + repUpName + ". Сколько: " + repUp + ". Осталось: " + usersHASH[chatId][userId].reputation);
		bot.sendMessage(chatId, "Поздравляю! Вы передали: " + repUp + ", пользователю: " + repUpName + ". Теперь ваша репутация равна: " + usersHASH[chatId][userId].reputation + ".");
	}
	else if(usersHASH[chatId][userId] == undefined)
	{
		bot.sendMessage(chatId, "Вы не зарегистрированы! Для регистрации отправьте: /regme");
	}
	else if(usersHASH[chatId][userId].reputation < repUp){
		bot.sendMessage(chatId, "Ваша репутация должна быть выше, чем та которой вы хотите поделиться! Ваша репутация равна: " + usersHASH[chatId][userId].reputation + ".");
	}
	else bot.sendMessage(chatId, "Я не знаю что, но что-то пошло не так!");


	// .stringify - convert JS cpde to JSON (hash, replace, formatting)
	usersJSON = JSON.stringify(usersHASH, null,	'\t');
	// SAVE DATA IN JSON
	fs.writeFileSync('users.json', usersJSON);
});


bot.onText(/\/role/, function (msg, match) {
	var chatId = msg.chat.id;
	var userId = msg.from.id;
	var userName = msg.from.username;
	bot.sendMessage(chatId, "Твой ранг: " + usersHASH[chatId][userId].rang + ", а также у тебя: " + usersHASH[chatId][userId].reputation + " репутации.");
});

bot.onText(/\/log/, function (msg, match) {
	var userId = msg.from.id;
	var userName = msg.from.username;
	var chatId = msg.chat.id;
	console.log("0. UID: " + userId + ". Chat ID: " + chatId);
    console.log(usersHASH[chatId]);
});


