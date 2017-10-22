let xml2js = require('xml2js');
let fs = require('fs');
let Metabolite = require('./metabolite.js');
let Reaction = require('./reaction.js');

function SBML() {
	this.name = "Unknown";
	this.reactions = [];
	this.metabolites = [];
}

function loadSBMLString(data, cb) {
	let res = new SBML();
	let parser = new xml2js.Parser();
	parser.parseString(data, function(err, result) {
		var metabolites = result.sbml.model[0].listOfSpecies[0].species;
		var reactions = result.sbml.model[0].listOfReactions[0].reaction;

		for (var i=0; i<metabolites.length; i++) {
			let data = metabolites[i];
			let m = new Metabolite(
				data.$.id,
				data.$.id.split("_")[0],
				data.$.name,
				null,
				null,
				data.$.compartment == "ext"
			);

			res.metabolites.push(m);
		}

		//id, genes, kegg, reactants, products, reversable
		for (var i=0; i<reactions.length; i++) {
			let data = reactions[i];
			let rsArray = data.listOfReactants[0].speciesReference;
			let psArray = data.listOfProducts[0].speciesReference;

			let rs = {};
			let ps = {};

			for (var j=0; j<rsArray.length; j++) {
				rs[rsArray[j].$.species] = parseFloat(rsArray[j].$.stoichiometry);
			}
			for (var j=0; j<psArray.length; j++) {
				ps[psArray[j].$.species] = parseFloat(psArray[j].$.stoichiometry);
			}

			let r = new Reaction(
				data.$.id,
				null,
				null,
				rs,
				ps,
				data.$.reversable == 'true'
			);
			r.retrieveMetabolites();

			res.reactions.push(r);
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

exports.SBML = SBML;
exports.loadSBMLFile = loadSBMLFile;
exports.loadSBMLString = loadSBMLString;
exports.loadSBMLUrl = null;

