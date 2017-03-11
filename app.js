var config = require('./config.js');
var models = require('./models/index');

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(config.telegram_api_key, {polling: true});

bot.getMe().then((me) => {
    console.log('Hello! My name is %s!', me.first_name);
    console.log('My id is %s.', me.id);
    console.log('And my username is @%s.', me.username);
});

bot.onText(/\/reg$|\/reg@Bacereus_bot/, (msg, match) => {
	var chatId = msg.chat.id;
	var userId = msg.from.id;
	var userName = "@" + msg.from.username;
	var user = new models.User({
		groupId: chatId,
		userId: userId,
		userName: userName,
	});

	user.save(function(err){
	if (err) {
			console.log(err);
		}
	else {
			bot.sendMessage(chatId, "Поздравляю! Твой ранг: Newbie, а также у тебя 0 репутации.");
		}
	});
});	

bot.onText(/\/regme$|\/regme@Bacereus_bot/, (msg, match) => {
	var userRep;
	var chatId = msg.chat.id;
	var userId = msg.from.id;
	var userName = "@" + msg.from.username;


	randomVar = Math.floor((Math.random() * 10) + 1);

	switch(true) {
		case randomVar <= 5: 
				userRep = -10;
		break;
		case randomVar > 5: 
				userRep = 10;
		break;
	};

	var user = new models.User({
		groupId: chatId,
		userId: userId,
		userName: userName,
		reputation: userRep,
	});

	user.save((err) => {
		if (err) {
				console.log(err);
			}
		else {
			if(userRep < 0){
				bot.sendMessage(chatId, "Поздравляю! Ты неудачник! И твое звание: " + "#userRole#" + ", а также поздравляю тебя с тем, что твоя репутация равна:" + userRep);
			}
			else{
				bot.sendMessage(chatId, "Поздравляю! Оказывается ты везунчик! Твое звание: " + "#userRole#" + ", а также поздравляю тебя с тем, что твоя репутация равна:" + userRep + ". Советую сегодня сыграть тебе в лоторею! Сегодня явно твой день.");
			}
		}
	});
});

// /up @cosmos404 10
bot.onText(/\/up (.+) (.+)/, (msg, match) => {

	var chatId = msg.chat.id;
	var userId = msg.from.id;
	var userName = msg.from.username;
	var repUpName = match[1];
	var repUp = parseInt(match[2]);

	models.User.update({userName:repUpName, groupId: chatId}, {$inc:{reputation: +repUp}},(err, raw) => {
		if (err) console.log(err);
	});

	models.User.update({userId:userId, groupId: chatId}, {$inc:{reputation: -repUp}},(err, raw) => {
		if (err) console.log(err);
	});
});

bot.onText(/\/rank$|\/rank@Bacereus_bot/, (msg, match) => {
	var chatId = msg.chat.id;
	var userId = msg.from.id;

	models.User.findOne({ userId: userId, groupId: chatId}, function (err, user){
		models.Rank.findOne({reputation: {$lt: user.reputation}}, function(err, rank){
			bot.sendMessage(chatId, "Твой ранг: " + rank.rank + ", а также у тебя: " + user.reputation + " репутации.");
		}).sort({reputation: -1});
	});
});

bot.onText(/\/rank (.+)$|\/rank (.+)@Bacereus_bot/, (msg, match) => {
	var chatId = msg.chat.id;
	var userName = match[1];

	models.User.findOne({ userName: userName, groupId: chatId}, function (err, user){
		models.Rank.findOne({reputation: {$lt: user.reputation}}, function(err, rank){
			bot.sendMessage(chatId, "Ранг " + userName + ": " + rank.rank + ", а также у него: " + user.reputation + " репутации.");
		}).sort({reputation: -1});		
	});
});

bot.onText(/\/log/, (msg, match) => {
	var userId = msg.from.id;
	var userName = msg.from.username;
	var chatId = msg.chat.id;
});

bot.on('message', (msg) => {
	var chatId = msg.chat.id;
	var userId = msg.from.id;
	var msg = msg.text;
	var msgText =  msg.split(' ')[0]; 

	if(msgText != "/rank" && msgText != "/up" && msgText != "/reg" && msgText != "/regme" && msgText != "/log"){
		if(msg.split(' ').length > 10 && msg.trim().length > 25){
			models.User.update({userId:userId, groupId: chatId}, {$inc:{reputation: +3}},(err, raw) => {
				if (err) console.log(err);
			});
		}
		else if(msg.split(' ').length <= 4 && msg.trim().length <= 10) {
			models.User.update({userId:userId, groupId: chatId}, {$inc:{reputation: -1}},(err, raw) => {
				if (err) console.log(err);
			});
		}
	}
});