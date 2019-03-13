const Metabolite = require('./metabolite.js');
const Reaction = require('./reaction.js');
const Subsystem = require('./subsystem.js');
const Compartment = require('./compartment.js');
const sbml = require('./sbml.js');
const fs = require('fs');
const KEGG = require('../../KEGG');

function MetaboliteMeta() {
	this.reactions = [];
	this.producers = [];
	this.consumers = [];
	this.producer_subsystems = {};
	this.consumer_subsystems = {};
}

function ReactionMeta() {
	this.metabolites = [];
}

function Model(json) {
	this.json = json;

	// Process genes...
	this.genes = {};
	for (var i=0; i<json.reactions.length; i++) {
		let r = json.reactions[i];
		for (var j=0; j<r.genes.length; j++) {
			let g = r.genes[j];
			if (Array.isArray(g)) {
				for (var k=0; k<g.length; k++) {
					if (!this.genes.hasOwnProperty(g[k])) this.genes[g[k]] = [];
					this.genes[g[k]].push(r);
				}
			} else {
				if (!this.genes.hasOwnProperty(g)) this.genes[g] = [];
				this.genes[g].push(r);
			}
		}
	}

	// Process Enzymes
	this.enzymes = {};
	for (var i=0; i<json.reactions.length; i++) {
		let r = json.reactions[i];
		if (r.ec && r.ec != "") {
			if (!this.enzymes.hasOwnProperty(r.ec)) this.enzymes[r.ec] = [];
			this.enzymes[r.ec].push(r);
		}
	}

	// Make indices...
	this.index_reactions = {};
	this.index_metabolites = {};
	this.subsystems = {};

	for (var i=0; i<json.reactions.length; i++) {
		let r = json.reactions[i];
		this.index_reactions[r.id] = r;
		if (!this.subsystems[r.subsystem]) this.subsystems[r.subsystem] = [];
		this.subsystems[r.subsystem].push(r);
	}
	for (var i=0; i<json.metabolites.length; i++) {
		this.index_metabolites[json.metabolites[i].id] = json.metabolites[i];
	}

	// Reaction inferred data...
	this.react_meta = {};
	this.metmeta = {};

	for (var i=0; i<json.reactions.length; i++) {
		let r = json.reactions[i];
		if (!this.react_meta.hasOwnProperty(r.id)) this.react_meta[r.id] = new ReactionMeta();
		let meta = this.react_meta[r.id];	

		for (var x in r.reactants) {
			meta.metabolites.push(this.index_metabolites[x]);
			if (!this.metmeta.hasOwnProperty(x)) this.metmeta[x] = new MetaboliteMeta();
			this.metmeta[x].consumers.push(r);
			this.metmeta[x].reactions.push(r);
		}
		for (var x in r.products) {
			meta.metabolites.push(this.index_metabolites[x]);
			if (!this.metmeta.hasOwnProperty(x)) this.metmeta[x] = new MetaboliteMeta();
			this.metmeta[x].producers.push(r);
			this.metmeta[x].reactions.push(r);
		}
	}

	// Metabolite inferred data...
	// - producers / consumers
	// - subsystems
	// TODO Ensure uniqueness of metab meta lists
}

Model.prototype.getReactionById = function(id) {
	return this.index_reactions[id];
}

Model.prototype.getReactionByName = function(name) {

}

Model.prototype.getReactionsByGene = function(gene) {
	return this.genes[gene];
}

Model.prototype.getReactionsBySubsystem = function(subsys) {

}

Model.prototype.listSubsystems = function() {

}

Model.prototype.metaboliteProducers = function(mid) {
	if (!this.metmeta.hasOwnProperty(mid)) return null;
	return this.metmeta[mid].producers;
}

Model.prototype.metaboliteConsumers = function(mid) {
	if (!this.metmeta.hasOwnProperty(mid)) return null;
	return this.metmeta[mid].consumers;
}

Model.prototype.metaboliteReactions = function(mid) {
	if (!this.metmeta.hasOwnProperty(mid)) return null;
	return this.metmeta[mid].reactions;
}

Model.prototype.getMetaboliteById = function(id) {
	return this.index_metabolites[id];
}

Model.prototype.getMetabolitesBySubsystem = function(subsys) {

}

Model.prototype.createMetabolite = function(id, name, compartment) {

}

Model.prototype.addMetabolite = function(obj) {

}

Model.prototype.addMetaboliteFromKEGG = function(keggid) {

}

Model.prototype.createReaction = function(id, name) {

}

Model.prototype.addReaction = function(reaction, cb) {
	if (typeof reaction == "object") {
		// Add directly
	} else if (reaction.charAt(0) == "R") {
		console.log("FIND KEGG REACTION");
		// Add KEGG rection
		this.addReactionFromKEGG(reaction, cb);
	} else if (reaction.startsWith("ec")) {
		// Add enzyme
	} else {
		// Attempt to add gene
	}
}

Model.prototype.addReactionFromKEGG = function(keggid, cb) {
	let kr = KEGG.getReactionById(keggid, (kr) => {
		console.log("KR",kr);
		cb();
	});
}

Model.prototype.addGeneFromKEGG = function(gene) {

}

Model.prototype.addGene = function(gene) {
	// Auto find gene/enzyme reaction info
}

Model.prototype.addEnzyme = function(ec) {
	// Auto find enzyme reaction info
}

Model.prototype.knockOut = function(gene) {
	
}

/*Model.prototype.search = function(s) {
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
}*/

/*SBML.prototype.addToIndex = function(id, name, item) {
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
}*/

Model.prototype.saveToFile = function(filename, cb) {
	// TODO Check file extension
	fs.writeFile(filename, this.stringify(), function(err) {
		cb(err);
	});
}

Model.prototype.getJSON = function() {
	return this.json;
}

Model.prototype.stringify = function() {
	return JSON.stringify(this.json, undefined, 2);
}

function patchID(id) {
	return id.replace(/_LPAREN_/g,"(").replace(/_RPAREN_/g,")").replace(/_DASH_/g, "-");
}

function loadJSON(json) {
	if (typeof json == "object") return new Model(json);
	else return new Model(JSON.parse(json));	
}

function loadFile(filename, cb) {
	fs.readFile(filename, 'utf8', function(err, data) {
		cb(loadString(data));
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

function loadString(data) {
	if (data.charAt(0) == "{") return loadJSON(data);
	else if (data.charAt(0) == "<") return new Model(sbml(data));
	else return null;
}

function loadUrl(url, cb) {
	ajax({
		url: url,
		type: "get",
		dataType: "text/plain",
		success: function(data) {
			cb(loadString(data));
		},
		error: function() {
			cb(null);
		}
	});
}

exports.Model = Model;
exports.fromFile = loadFile;
exports.fromJSON = loadJSON;
exports.fromString = loadString;
exports.fromUrl = loadUrl;

