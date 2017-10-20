let csv = require('csv-parser');
let fs = require('fs');
let Metabolite = require('./metabolite.js');
let Reaction = require('./reaction.js');

function loadMetabolites(filename, cb) {
	fs.createReadStream(filename)
		.pipe(csv())
		.on('data', function(data) {
			if (data.entry) {
				let m = new Metabolite(
					data.entry.replace(/[\[\]]/g, ""),
					(data.kegg == '-') ? null : data.kegg,
					data.name,
					data.uncharged_formula,
					(data.charge == '-') ? null : data.charge,
					data.external == 'True'
				);

				//console.log(m);
			}
		}
	);
}

function loadReactions(filename, cb) {
	fs.createReadStream(filename)
		.pipe(csv())
		.on('data', function(data) {
			/*let m = new Reaction(
				data.rID,
				(data.kegg == '-') ? null : data.kegg,
				data.name,
				data.uncharged_formula,
				(data.charge == '-') ? null : data.charge,
				data.external == 'True'
			);*/

			let r = new Reaction(
				data.rID,
				(data.genes == '-') ? [] : data.genes.split(','),
				data.ec,
				data.kegg,
				data.reaction_form,
				data.reaction,
				data.Pathway
			);
			r.retrieveMetabolites();

			//console.log(r);
		}
	);
}

exports.loadMetabolites = loadMetabolites;
exports.loadReactions = loadReactions;


