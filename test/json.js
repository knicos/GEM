const assert = require('assert');
const gem = require('../');

let model = {
	metabolites: [
		{id: "M_T1", name: "Met1", compartment: "c"},
		{id: "M_T2", name: "Met2", compartment: "c"}
	],
	reactions: [
		{id: "R_1", name: "React1", reactants: {"M_T1": 1}, products: {"M_T2": 1},
			genes: ["sll0001",["sll0002","sll0003"]]}
	],
	compartments: [
		{id: "c", name: "Cytoplasm"}
	]
};

describe("Loading of JSON model", function() {
	it("loads a trivial model", function() {
		let m = gem.fromJSON(model);
		assert.ok(m);
	});

	it("can get metabolite by id", function() {
		let m = gem.fromJSON(model);
		assert.equal(m.getMetaboliteById("M_T2").name, "Met2");
	});

	it("can get metabolite producers", function() {
		let m = gem.fromJSON(model);
		let p = m.metaboliteProducers("M_T2");
		assert.equal(p.length, 1);
		assert.equal(p[0].id, "R_1");
	});
});

