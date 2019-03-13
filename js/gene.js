let genes = {};

function Gene(code) {
	this.id = code;
	this.enzymes = [];
	this.reactions = [];
	this.active = true;
	//this.expression = 1.0;

	genes[code] = this;
}

Gene.getById = function(id) {
	// TODO Access database if not found locally
	return genes[id];
}

module.exports = Gene;

