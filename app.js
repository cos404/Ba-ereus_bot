/* 
 * @author Maxim Hvaschinsky 22division7@gmail.com
 * @license MIT
 */

'use strict';
var config = require('./config.js'),
	models = require('./models/index'),
	Admin = require('./admin.js'),
	Logic = require('./logic.js'),
	string = require('./string.json'),
	TelegramBot = require('node-telegram-bot-api');

var	bot = new TelegramBot(config.telegram_api_key, {polling: true}),
	admin = new Admin(),
	logic = new Logic();

bot.getMe().then((me) => {
    console.log('Hello! My name is %s!', me.first_name);
    console.log('My id is %s.', me.id);
    console.log('And my username is @%s.', me.username);
});

bot.onText(/\/reg(@Bacereus_bot$)?$/, (msg, match) => {
	let chatId = msg.chat.id,
		userId = msg.from.id,
		userName = "@" + msg.from.username,
		rank;

	Promise.all([	logic.addUser(chatId, userId, userName, 0),
					admin.getLanguage(chatId),
					logic.getRank(chatId, 0)	])
	.then(
		results =>{
			let language = results[1],
				rank = results[2];
			bot.sendMessage(chatId, admin.getString(string[language].reg, rank));
	})
	.catch(err => {
		console.log(err);
		admin.getLanguage(chatId).then(language=>{bot.sendMessage(chatId, admin.getString(string[language].yetReg));})
	});
});	

bot.onText(/\/regme(@Bacereus_bot$)?$/, (msg, match) => {
	let chatId = msg.chat.id,
		userId = msg.from.id,
		userName = "@" + msg.from.username,
		randomVar = Math.floor((Math.random() * 10) + 1),
		reputation;

	switch(true) {
		case 	randomVar <= 5: 
				reputation = -10;
				break;		
		case 	randomVar > 5: 
				reputation = 10;
				break;
	};

	Promise.all([	logic.addUser(chatId, userId, userName, reputation),
					admin.getLanguage(chatId),
					logic.getRank(chatId, reputation)	])
	.then(
		results => {
			let	language = results[1],
				rank = results[2];
			if(reputation > 0)	bot.sendMessage(chatId, admin.getString(string[language].regmeGood, rank, reputation));
			else bot.sendMessage(chatId, admin.getString(string[language].regmeBad, rank, reputation));
	})
	.catch(err => {
		console.log(err);
		admin.getLanguage(chatId).then(language=>{bot.sendMessage(chatId, admin.getString(string[language].yetReg));})
	});
});

bot.onText(/\/up (.+) (.+)$/, (msg, match) => { // /up @cosmos404 10
	let	chatId = msg.chat.id,
		userId = msg.from.id,
		userName = msg.from.username,
		repUpName = match[1],
		repUp = parseInt(match[2]);

	Promise.all([	admin.getLanguage(chatId), 
					logic.getReputation(chatId, userId, "id")	])
	.then(
		results => {
			let	language = results[0],
				reputation = results[1];

			if(reputation < repUp) bot.sendMessage(chatId, admin.getString(string[language].upLittle));
			else {
				models.User.update({userName:repUpName, chatId: chatId}, {$inc:{reputation: +repUp}},(err, raw) => {
					if (err) console.log(err);
				});
				models.User.update({userId:userId, chatId: chatId}, {$inc:{reputation: -repUp}},(err, raw) => {
					if (err) console.log(err);
				});
			}
	})
	.catch(err => {console.log(err)});

});

bot.onText(/\/rank( .+)?(@Bacereus_bot$)?$/, (msg, match) => {
	let	chatId = msg.chat.id,
		user = (match[1]) ? match[1].trim() : msg.from.id,
		type = (match[1]) ? "name" : "id";

	admin.getLanguage(chatId)
	.then(
		language => {
			logic.getReputation(chatId, user, type)
			.then(
				reputation => {	
					logic.getRank(chatId, reputation)
					.then(
						rank => {
							if(!match[1])
								bot.sendMessage(chatId, admin.getString(string[language].rank, rank, reputation));
							else
								bot.sendMessage(chatId, admin.getString(string[language].rankHim, user, rank, reputation));
						}
					)
					.catch(err => {console.log(err)});
				}
			)
			.catch(err => bot.sendMessage(chatId, admin.getString(string[language].notReg)));
		}
	)
});

bot.onText(/\/addr (.+) (.+)(@Bacereus_bot$)?$/, (msg, match) => {
	let	chatId = msg.chat.id,
		userId = msg.from.id,
		rank = match[1],
		reputation = match[2];

	bot.getChatMember(chatId, userId).then((user) => {
		if(user.status == "administrator" || user.status == "creator"){
			admin.addr(chatId, rank, reputation);
		};
	});
});

bot.onText(/\/language(@Bacereus_bot$)?$/, (msg, match) => {
	let	chatId = msg.chat.id,
		userId = msg.from.id,
		options = {
			reply_markup: JSON.stringify({
				inline_keyboard: [
					[{ text: 'ru', callback_data: 'ru' }],
					[{ text: 'en', callback_data: 'en' }]
				]
			})
		};

	bot.getChatMember(chatId, userId).then((user) => {
		if(user.status == "administrator" || user.status == "creator"){
			bot.sendMessage(chatId, 'Choose language:', options);
		};
	});

});

bot.onText(/\/log/, (msg, match) => {
	let	userId = msg.from.id,
		userName = msg.from.username,
		chatId = msg.chat.id;

	console.log(userId + " " + userName + " " + chatId);
});

bot.on('message', (msg) => {
	let	chatId = msg.chat.id,
		userId = msg.from.id,
		msgText = msg.text,
		chatTitle = msg.chat.title;

	if(msg.new_chat_participant != undefined && msg.new_chat_participant.id == 287114980){
		let chat = new models.Chat({
			chatId: chatId,
		});
		chat.save(function(err){
			if (err) {
				console.log("Err chat.save: " + err);
			}
			else console.log("Chat added!");
		});
	}
	else if(!msgText.match(/\/(.+)/)){
		if(msgText.split(' ').length > 10 && msgText.trim().length > 25){
			models.User.update({userId:userId, chatId: chatId}, {$inc:{reputation: +3}},(err, raw) => {
				if (err) console.log(err);
			});
		}
		else if(msgText.split(' ').length <= 4 && msgText.trim().length <= 10) {
			models.User.update({userId:userId, chatId: chatId}, {$inc:{reputation: -1}},(err, raw) => {
				if (err) console.log(err);
			});
		}
	}
});

bot.on('callback_query', (msg) => {
	let	language = msg.data,
		chatId = msg.message.chat.id,
		userId = msg.from.id,
		msgId = msg.message.message_id;

	bot.getChatMember(chatId, userId).then((user) => {
		if(user.status == "administrator" || user.status == "creator"){
			if (["ru","en"].indexOf(language) > -1) {
				bot.editMessageText(admin.getString(string[language].setLanguage),
					{
						chat_id: msg.message.chat.id,
						message_id: msg.message.message_id
					});
				admin.setLanguage(chatId, language);
			}
		};
	});
});