let Metabolites = require('./metabolite.js');

let reactions = {};

function Reaction(id, name) {
	this.id = id;
	this.ec = null;
	this.kegg = null;

	this.name = name;
	this.abbreviation = name;
	this.equation = null;
	this.subsystem = null;

	this.genes = [];
	this.reactants = {};
	this.products = {};
	this.reversable = false;
	this.lower = 0.0;
	this.upper = 99999999.0;
}

/*Reaction.prototype.parseEquation = function() {
	let lhs,rhs;

	if (this.equation.indexOf("<=>") >= 0) {
		this.reversable = true;
		let s = this.equation.split("<=>");
		lhs = s[0].trim();
		rhs = s[1].trim();
	} else if (this.equation.indexOf("<=") >= 0) {
		let s = this.equation.split("<=");
		rhs = s[0].trim();
		lhs = s[1].trim();
	} else if (this.equation.indexOf("=>") >= 0) {
		let s = this.equation.split("=>");
		lhs = s[0].trim();
		rhs = s[1].trim();
	} else {
		//console.log("Unknown formula: ", this);
		this.accumulator = true;
		lhs = this.equation.trim();
	}

	if (lhs) this.inputs = parseExpression(lhs);
	if (rhs) this.outputs = parseExpression(rhs);
}*/

module.exports = Reaction;


