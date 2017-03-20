var models = require('./models/index');

var chatId, 
	rank,
	reputation,
	language;

function Admin(){

}

Admin.prototype.addr = function(chatId, rank, reputation){
	this.chatId = chatId;
	this.rank = rank;
	this.reputation = reputation;

	var rankModel = new models.Rank({
		groupId: chatId,
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

Admin.prototype.setLanguage = function(chatId, language) {
	this.language = language;
	models.Group.update({groupId: chatId}, {language: language},(err, raw) => {
		if (err) console.log(err);
	});
}

Admin.prototype.getLanguage = function(chatId) {
	this.chatId = chatId;
	var lang;
	var promise = new Promise(function(resolve,reject){
		models.Group.findOne({groupId:chatId}, function(err, setting){
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
	console.log(nowText);
	return nowText; 
}

module.exports = Admin;