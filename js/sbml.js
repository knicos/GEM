let xml2js = require('xml2js');
let fs = require('fs');
let Metabolite = require('./metabolite.js');
let Reaction = require('./reaction.js');
const Subsystem = require('./subsystem.js');
const Compartment = require('./compartment.js');

function SBML() {
	this.name = "Unknown";
	this.reactions = [];
	this.metabolites = [];
	this.index_reactions = {};
	this.index_metabolites = {};
	this.subsystems = {};
	this.enzymes = {};
	this.compartments = {};
	this.genes = {};
	this.index = {};
}

SBML.prototype.getReactionById = function(id) {
	return this.index_reactions[id];
}

SBML.prototype.getMetaboliteById = function(id) {
	return this.index_metabolites[id];
}

SBML.prototype.search = function(s) {
	if (!s || s.length == 0) {
		var res = [];
		for (var x in this.subsystems) {
			res.push(this.subsystems[x]);
		}
		return res;
	}

	var words = s.split(" ");

	console.log("Search words", words);

	var res = this.index[words[0]];
	if (res && words.length == 1) return res;
	res = [];

	if (!res) {
		// Regex search
	} else {
		// Filter by other words
	}

	return res;
}

SBML.prototype.addToIndex = function(id, name, item) {
	var record = {};

	if (id) {
		var id2s = id.substring(2).split("_");
		for (var i=0; i<id2s.length; i++) {
			var label = id2s[i].toLowerCase();
			if (!this.index.hasOwnProperty(label)) this.index[label] = [];
			this.index[label].push(item);
			record[label] = true;
		}
	}

	if (name) {
		var names = name.split(" ");
		for (var i=0; i<names.length; i++) {
			var label = names[i].toLowerCase();
			if (record[label]) continue;
			if (!this.index.hasOwnProperty(label)) this.index[label] = [];
			this.index[label].push(item);
		}
	}
}

function processGenes(model, reaction, genes) {
	if (genes.charAt(0) == "(") {
		// TODO Split genes
	} else {
		var gs = genes.split(" and ");
		for (var i=0; i<gs.length; i++) {
			reaction.genes.push([gs[i]]);
			if (model.genes.hasOwnProperty(gs[i]) == false) model.genes[gs[i]] = [];
			model.genes[gs[i]].push(reaction);
		}
	}
}

function patchID(id) {
	return id.replace(/_LPAREN_/g,"(").replace(/_RPAREN_/g,")").replace(/_DASH_/g, "-");
}

function loadSBMLString(data, cb) {
	let res = new SBML();
	let parser = new xml2js.Parser();
	parser.parseString(data, function(err, result) {
		var compartments = result.sbml.model[0].listOfCompartments[0].compartment;
		var metabolites = result.sbml.model[0].listOfSpecies[0].species;
		var reactions = result.sbml.model[0].listOfReactions[0].reaction;

		for (var i=0; i<compartments.length; i++) {
			let data = compartments[i];
			let c = new Compartment(
				data.$.id,
				data.$.name
			);
			res.addToIndex(c.id, c.name, c);
			res.compartments[c.id] = c;
		}

		for (var i=0; i<metabolites.length; i++) {
			let data = metabolites[i];
			let m = new Metabolite(
				data.$.id,
				null,
				data.$.name,
				null,
				null,
				data.$.compartment == "e"
			);
			m.compartment = data.$.compartment;

			if (!res.compartments[data.$.compartment]) {
				console.error("Missing compartment");
			} else {
				res.compartments[data.$.compartment].addMetabolite(m);
			}
			res.metabolites.push(m);
			res.index_metabolites[m.id] = m;
			res.addToIndex(m.id, m.name, m);
		}

		//id, genes, kegg, reactants, products, reversable
		for (var i=0; i<reactions.length; i++) {
			let data = reactions[i];

			// Process notes section
			let notes = (data.notes) ? data.notes[0].body[0].p : [];

			let rsArray = (data.listOfReactants) ? data.listOfReactants[0].speciesReference : [];
			let psArray = (data.listOfProducts) ? data.listOfProducts[0].speciesReference : [];
			let kinParams = data.kineticLaw[0].listOfParameters[0].parameter;

			let rs = {};
			let ps = {};

			for (var j=0; j<rsArray.length; j++) {
				var stoich = (rsArray[j].$.stoichiometry !== undefined) ? parseFloat(rsArray[j].$.stoichiometry) : 1;
				rs[rsArray[j].$.species] = stoich;
			}
			for (var j=0; j<psArray.length; j++) {
				var stoich = (psArray[j].$.stoichiometry !== undefined) ? parseFloat(psArray[j].$.stoichiometry) : 1;
				ps[psArray[j].$.species] = stoich;
				if (rs.hasOwnProperty(psArray[j].$.species)) {
					console.warn("Metabolite on both sides", data.$.id);
				}
			}

			let r = new Reaction(
				data.$.id,
				null,
				null,
				rs,
				ps,
				data.$.reversable != 'false'
			);
			r.name = data.$.name;
			r.retrieveMetabolites();

			for (var j=0; j<kinParams.length; j++) {
				if (kinParams[j].$.id == "UPPER_BOUND") {
					r.upper = parseFloat(kinParams[j].$.value);
					r.original_upper = r.upper;
				} else if (kinParams[j].$.id == "LOWER_BOUND") {
					r.lower = parseFloat(kinParams[j].$.value);
					r.original_lower = r.lower;
				}
			}

			for (var j=0; j<notes.length; j++) {
				//console.log("NOTE", notes[j]);
				var snote = notes[j].split(":");
				switch (snote[0]) {
				case "GENE_ASSOCIATION"		:	processGenes(res, r, snote[1].trim());
												break;
				case "SUBSYSTEM"			:	r.subsystem = snote[1].trim();
												if (res.subsystems.hasOwnProperty(r.subsystem) == false) {
													res.subsystems[r.subsystem] = new Subsystem(r.subsystem);
													res.addToIndex(undefined, r.subsystem, res.subsystems[r.subsystem]);
												}
												res.subsystems[r.subsystem].addReaction(r);
												break;
				case "EC Number"			:	r.ec = snote[1].trim();
												break;
				}
			}

			res.reactions.push(r);
			res.index_reactions[r.id] = r;
			res.addToIndex(r.id, r.name, r);
			//console.log(r);
		}

		if (cb) cb(res);
	});
}

function loadSBMLFile(filename, cb) {
	fs.readFile(filename, function(err, data) {
		loadSBMLString(data, cb);
	});
}

var isnode = false;
var request = null;

// Make sure we have ajax in node
if (typeof XMLHttpRequest == "undefined") {
	request = require('request');
	isnode = true;
}

function ajax(options) {

	if (isnode) {
		request(options.url, function(error, response, body) {
			if (error) options.error();
			else options.success(body);
		});
	} else {
		var xhr = new XMLHttpRequest();
		//xhr.withCredentials = true;
		xhr.open(options.type.toUpperCase(), options.url);
		xhr.setRequestHeader('Content-Type', 'text/plain');
		xhr.onreadystatechange = function() {
			//console.log("RESPONSE",xhr,xhr.status, xhr.responseText);
			if (xhr.readyState === XMLHttpRequest.DONE) {
				if (xhr.status === 200) {
					options.success(xhr.responseText);
				} else {
					options.error(xhr, xhr.status, xhr.responseText);
				}
			}
		};

		try {
			if (options.data) {
				xhr.send((options.data) ? JSON.stringify(options.data) : undefined);
			} else {
				xhr.send();
			}
		} catch(e) {
			options.error(e);
		}
	}
}

function loadSBMLUrl(url, cb) {
	ajax({
		url: url,
		type: "get",
		dataType: "text/plain",
		success: function(data) {
			loadSBMLString(data, cb);
		},
		error: function() {
			cb(null);
		}
	});
}

exports.SBML = SBML;
exports.loadSBMLFile = loadSBMLFile;
exports.loadSBMLString = loadSBMLString;
exports.loadSBMLUrl = loadSBMLUrl;

