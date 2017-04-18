/* 
 * @author Maxim Hvaschinsky 22division7@gmail.com
 * @license MIT
 */

'use strict';
var models = require('./models/index');
function Admin(){}

Admin.prototype.addr = function(chatId, rank, reputation){
	this.chatId = chatId;
	this.rank = rank;
	this.reputation = reputation;

	var rankModel = new models.Rank({
		chatId: chatId,
		rank: rank,
		reputation: reputation,
	});

	rankModel.save(function(err){
	if (err) {
			console.log(err);
		}
	else {
			console.log("Добавлен ранк: " + rank);
		}
	});
}

Admin.prototype.listr = function(chatId) {
	this.chatId = chatId;
	var ranks = "";
	var promise = new Promise(function(resolve, reject){
		models.Rank.find({chatId: chatId}, function(err, rank){
			if (err) reject(err);
			else if(rank){
				for(var key in rank){
					ranks += "\n" + rank[key].rank + ": " + rank[key].reputation;
				}
				resolve(ranks);
			}
		}).sort({reputation: -1});
		
	});
	return promise;
}

Admin.prototype.setLanguage = function(chatId, language) {
	this.language = language;
	models.Chat.update({chatId: chatId}, {language: language},(err, raw) => {
		if (err) console.log(err);
	});
}

Admin.prototype.getLanguage = function(chatId) {
	this.chatId = chatId;
	var promise = new Promise(function(resolve,reject){
		models.Chat.findOne({chatId:chatId}, function(err, setting){
			if(err) reject(err);
			else resolve(setting.language);
		});
	});
	return promise;
}

Admin.prototype.getString = function(text, options) {
	var nowText = text;
	for(var i=1; i < arguments.length; i++) {
		nowText = nowText.replace(/{{.{1,}?}}/, arguments[i]);
	}
	return nowText; 
}

module.exports = Admin;