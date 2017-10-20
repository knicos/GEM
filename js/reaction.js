let Metabolites = require('./metabolite.js');

function Reaction(id, genes, kegg, reactants, products, reversable) {
	this.id = id;
	this.genes = genes;
	this.enzyme = null;
	this.kegg = kegg;
	this.equation = null;
	//this.label = label;
	this.pathway = null;

	this.metabolites = {};
	this.enzymes = {};

	this.inputs = reactants;
	this.outputs = products;
	this.reversable = reversable;

	//if (this.equation !== null) this.parseEquation();
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

Reaction.prototype.retrieveMetabolites = function() {
	for (var x in this.inputs) {
		this.metabolites[x] = Metabolites.getByID(x);
		if (!this.metabolites[x]) {
			console.error("Missing metabolite: ", x, this);
		} else {
			this.metabolites[x].addReaction(this);
		}
	}

	for (var x in this.outputs) {
		this.metabolites[x] = Metabolites.getByID(x);
		if (!this.metabolites[x]) {
			console.error("Missing metabolite: ", x, this);
		} else {
			this.metabolites[x].addReaction(this);
		}
	}
}

/*function parseExpression(e) {
	let s = e.split("+");
	let res = {};

	for (var i=0; i<s.length; i++) {
		let t = s[i].trim();
		if (t.indexOf(" ") >= 0) {
			let s2 = t.split(" ");
			res[s2[1].replace(/[\[\]]/g, "")] = parseFloat(s2[0]);
		} else {
			res[t.replace(/[\[\]]/g, "")] = 1;
		}
	}

	return res;
}*/

module.exports = Reaction;


