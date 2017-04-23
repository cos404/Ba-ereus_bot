/* 
 * @author Maxim Hvaschinsky 22division7@gmail.com
 * @license MIT
 */

'use strict';
var models = require('./models/index');
function Logic(){}

Logic.prototype.addUser = function(chatId, userId, userName, userRep){
	this.chatId = chatId;
	this.userId = userId;
	this.userName = userName;
	this.userRep = userRep;

	var user = new models.User({
		chatId: chatId,
		userId: userId,
		userName: userName,
		reputation: userRep
	});

	var promise = new Promise(function(resolve, reject){
		user.save(function(err){
			if (err) reject(err);
			else resolve(true);
		});
	});
	return promise;
}

Logic.prototype.getUsers = function(chatId, mod, type){
	this.chatId = chatId;
	this.mod = mod; //countWin || reputation
	this.type = type; // -1 || 1
	var users = "";
	var obj = {};
	obj[mod] = type;
	var promise = new Promise(function(resolve, reject){
		models.User.find({chatId: chatId}, function(err, user){
			if (err) reject(err);
			else if(user){
				for(var key in user){
					users += "\n" + user[key].userName + ": " + user[key][mod];
				}
				resolve(users);
			}
		}).limit(10).sort(obj);
	});
	return promise;
}

Logic.prototype.getRank = function(chatId, reputation){
	this.chatId = chatId;
	this.reputation = reputation;
	
	var promise = new Promise(function(resolve,reject){
		models.Rank.findOne({reputation: {$lte: reputation}, chatId: chatId}, function (err, rank){
			if(err) reject(err);
			else if(rank == null) {
				rank = models.Rank.findOne({chatId: chatId}, (err, rank) => {
					if(err) reject(err);
					else if(rank) resolve(rank.rank); 
					else resolve("undefined");
				}).limit(1).sort({reputation: 1});
			}
			else resolve(rank.rank);
		}).sort({reputation: -1});
	});
	return promise;
}

Logic.prototype.getReputation = function(chatId, user, type){
	this.chatId = chatId;
	this.user = user;
	this.type = type;

	var promise = new Promise(function(resolve, reject){
		if(type == "name") {
			models.User.findOne({chatId: chatId, userName: user}, function(err, user){
				if(err) reject(console.log(err));
				else if(user) resolve(user.reputation);
				else reject();
			})
		}
		else if(type == "id"){
			models.User.findOne({chatId: chatId, userId: user}, function(err, user){
				if (err) reject(console.log(err));
				else if(user) resolve(user.reputation);
				else reject();
			})
		}
	});
	return promise;
}

module.exports = Logic;