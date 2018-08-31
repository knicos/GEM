let xml2js = require('xml2js');
let Metabolite = require('./metabolite.js');
let Reaction = require('./reaction.js');
const Subsystem = require('./subsystem.js');
const Compartment = require('./compartment.js');

function processGenes(reaction, genes) {
	let g = [];
	reaction.genes = g;

	genes = genes.replace(/[\(\)]/g, "");


		var gs = genes.split(" and ");
		if (gs.length == 1 && gs[0] == "") return;

		for (var i=0; i<gs.length; i++) {
			let gors = gs[i].split(" or ");
			if (gors.length == 1) g.push(gors[0]);
			else g.push(gors);
		}
}

function patchID(id) {
	return id.replace(/_LPAREN_/g,"(").replace(/_RPAREN_/g,")").replace(/_DASH_/g, "-");
}

function loadSBMLString(data) {
	let res = {
		reactions: [],
		metabolites: [],
		compartments: []
	};

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
			//res.addToIndex(c.id, c.name, c);
			res.compartments.push(c);
		}

		for (var i=0; i<metabolites.length; i++) {
			let data = metabolites[i];
			let notes = (data.notes) ? data.notes[0].body[0].p : [];

			let m = new Metabolite(
				data.$.id,
				data.$.name,
				data.$.compartment
			);

			for (var j=0; j<notes.length; j++) {
				//console.log("NOTE", notes[j]);
				var snote = notes[j].split(":");
				switch (snote[0]) {
				case "CHARGE"	:	m.charge = parseInt(snote[1].trim());
									break;
				case "FORMULA"	:	m.formula = snote[1].trim();
									break;
				}
			}

			// TODO Get CHARGE,FORMULA

			//if (!res.compartments[data.$.compartment]) {
			//	console.error("Missing compartment");
			//} else {
				//res.compartments[data.$.compartment].addMetabolite(m);
			//}
			res.metabolites.push(m);
			//res.index_metabolites[m.id] = m;
			//res.addToIndex(m.id, m.name, m);
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
				data.$.name
			);
			r.products = ps;
			r.reactants = rs;
			r.reversable = data.$.reversible != 'false';
			//r.retrieveMetabolites();

			for (var j=0; j<kinParams.length; j++) {
				if (kinParams[j].$.id == "UPPER_BOUND") {
					r.upper = parseFloat(kinParams[j].$.value);
					//r.original_upper = r.upper;
				} else if (kinParams[j].$.id == "LOWER_BOUND") {
					r.lower = parseFloat(kinParams[j].$.value);
					//r.original_lower = r.lower;
				}
			}

			for (var j=0; j<notes.length; j++) {
				//console.log("NOTE", notes[j]);
				var snote = notes[j].split(":");
				switch (snote[0]) {
				case "GENE_ASSOCIATION"		:	processGenes(r, snote[1].trim());
												break;
				case "SUBSYSTEM"			:	r.subsystem = snote[1].trim();
												//if (res.subsystems.hasOwnProperty(r.subsystem) == false) {
													//res.subsystems[r.subsystem] = new Subsystem(r.subsystem);
													//res.addToIndex(undefined, r.subsystem, res.subsystems[r.subsystem]);
												//}
												//res.subsystems[r.subsystem].addReaction(r);
												break;
				case "EC Number"			:	r.ec = snote[1].trim();
												break;
				//AUTHORS
				//Confidence
				}
			}

			res.reactions.push(r);
			//res.index_reactions[r.id] = r;
			//res.addToIndex(r.id, r.name, r);
			//console.log(r);
		}

		// Process metabolites
		//for (var i=0; i<res.metabolites.length; i++) res.metabolites[i].updateSubsystem();

		//if (cb) cb(res);
	});

	return res;
}

module.exports = loadSBMLString;

