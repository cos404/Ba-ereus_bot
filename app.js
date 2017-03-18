var config = require('./config.js');
var models = require('./models/index');

var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(config.telegram_api_key, {polling: true});

var Admin = require('./admin.js');
	admin = new Admin();

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
			models.Rank.findOne({reputation: {$lte: 0}, groupId: chatId}, (err, rank) => {
				if(err) throw err;
				if(rank != null) bot.sendMessage(chatId, `Поздравляю! Твой ранг: ${rank.rank}, а также у тебя 0 репутации.`);
				else bot.sendMessage(chatId, `Поздравляю! Твой ранг: {UNDEFINED}, а также у тебя 0 репутации.`);

				if(rank) console.log("2 " + rank);
			}).sort({reputation: -1});		
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
				models.Rank.findOne({reputation: {$lte: user.reputation}}, (err, rank) => {
					if(rank != null) bot.sendMessage(chatId, `Поздравляю! Ты неудачник! И твое звание: ${rank.rank}, а также поздравляю тебя с тем, что твоя репутация равна: ${userRep}`);
					else bot.sendMessage(chatId, `Поздравляю! Ты неудачник! И твое звание: {UNDEFINED}, а также поздравляю тебя с тем, что твоя репутация равна: ${userRep}`);
				}).sort({reputation: -1});
			}
			else{

				models.Rank.findOne({reputation: {$lte: user.reputation}}, (err, rank) => {
					if(rank != null) bot.sendMessage(chatId, `Поздравляю! Оказывается ты везунчик! Твое звание: ${rank.rank}, а также поздравляю тебя с тем, что твоя репутация равна: ${userRep}. Советую сегодня сыграть тебе в лоторею! Сегодня явно твой день.`);
					else bot.sendMessage(chatId, `Поздравляю! Оказывается ты везунчик! Твое звание: {UNDEFINED}, а также поздравляю тебя с тем, что твоя репутация равна: ${userRep}. Советую сегодня сыграть тебе в лоторею! Сегодня явно твой день.`);
				}).sort({reputation: -1});				
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

	models.User.findOne({userId: userId, groupId: chatId}, function (err, user){
		if(err) console.log(err);
		if(user != null)
		models.Rank.findOne({reputation: {$lte: user.reputation}}, function(err, rank){
				if(rank != null) bot.sendMessage(chatId, `Твой ранг: ${rank.rank}, а также у тебя: ${user.reputation} репутации.`);
				else bot.sendMessage(chatId, `Твой ранг: {UNDEFINED}, а также у тебя: ${user.reputation} репутации.`);
		}).sort({reputation: -1});

	});
});

bot.onText(/\/rank (.+)$|\/rank (.+)@Bacereus_bot/, (msg, match) => {
	var chatId = msg.chat.id;
	var userName = match[1];

	models.User.findOne({ userName: userName, groupId: chatId}, function (err, user){
		if(user != null)
		models.Rank.findOne({reputation: {$lte: user.reputation}}, function(err, rank){
			if(rank != null) bot.sendMessage(chatId, `Ранг ${userName}: ${rank.rank}, а также у него: ${user.reputation} репутации.`);
			else bot.sendMessage(chatId, `Ранг ${userName}: {UNDEFINED}, а также у него: ${user.reputation} репутации.`);
		}).sort({reputation: -1});		
	});
});

bot.onText(/\/addr (.+) (.+)$|\/addr (.+) (.+)@Bacereus_bot/, (msg, match) => {
	var chatId = msg.chat.id;
	var userId = msg.from.id;
	var rank = match[1];
	var reputation = match[2];

	bot.getChatMember(chatId, userId).then((user) => {
		if(user.status == "administrator" || user.status == "creator"){
			admin.addr(chatId, rank, reputation);
		};
	});
});

bot.onText(/\/language/, (msg, match) => {
	var chatId = msg.chat.id;
	var userId = msg.from.id;

	var options = { 
		reply_markup: JSON.stringify({ 
			inline_keyboard: [ 
				[{ text: 'ru', callback_data: 'ru' }], 
				[{ text: 'en', callback_data: 'en' }],
				[{ text: 'fr', callback_data: 'fr' }]
			]
		})
	};

	bot.getChatMember(chatId, userId).then((user) => {
		if(user.status == "administrator" || user.status == "creator"){
			bot.sendMessage(chatId, 'Choose language:', options); 
		};
	});
});

bot.onText(/\/start/, (msg, match) => {
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

bot.on('callback_query', (msg) => { 
	var lang = msg.data; 
	var chatId = msg.message.chat.id;
	var userId = msg.from.id;
	var msgId = msg.message.message_id;

	bot.getChatMember(chatId, userId).then((user) => {
		if(user.status == "administrator" || user.status == "creator"){
			if (["ru","en"].indexOf(lang) > -1) { 
				bot.editMessageText("WORK", {
      				chat_id: msg.message.chat.id,
      				message_id: msg.message.message_id
    			});
				admin.language(chatId, lang); 
			} 
		};
	});
});