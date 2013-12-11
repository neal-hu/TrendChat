function Conversation(id, name){
	this.name = name;
	this.id = id;
	this.people = [];
	this.status = "available";
};

Conversation.prototype.addPerson = function(username){
	if (this.status == "available"){
		this.people.push(username);
	}
};


module.exports = Conversation;