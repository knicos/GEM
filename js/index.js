let sbml = require('./sbml.js');
//sbml.loadSBML('../data/synechocystisPCC6803.xml');

exports.Metabolite = require('./metabolite.js');
exports.Reaction = require('./reaction.js');
exports.Genes = {};
exports.Enzymes = {};
exports.Compartments = {};
exports.fromFile = sbml.loadSBMLFile;
exports.fromString = sbml.loadSBMLString;
exports.fromURL = null;

