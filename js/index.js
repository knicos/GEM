let loader = require('./smbl.js');
loader.loadSBML('../data/synechocystisPCC6803.xml');

exports.Metabolite = require('./metabolite.js');
exports.Reaction = require('./reaction.js');
exports.Genes = {};
exports.Enzymes = {};
exports.Compartments = {};

