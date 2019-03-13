function Subsystem(name) {
	this.name = name;
	this.reactions = [];
}

Subsystem.prototype.addReaction = function(r) {
	this.reactions.push(r);
}

module.exports = Subsystem;

