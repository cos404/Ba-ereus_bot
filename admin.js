var models = require('./models/index');

var chatId, 
	rank,
	reputation;

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



module.exports = Admin;