function Metabolite(id, name, compartment) {
	this.id = id;
	this.kegg = null;
	this.biocyc = null;

	this.name = name;
	this.abbreviation = name;
	this.formula = null;
	this.charge = 0;
	//this.external = false;
	this.compartment = compartment;
	//this.producers = [];
	//this.consumers = [];
	//this.subsystems = {};

	//metabolite_index_id[id] = this;
	//metabolite_index_kegg[kegg] = this;

	//this.extra = null;
	//this.reactions = [];
	//this.index_reactions = {};
}

Metabolite.prototype.addReaction = function(r, consume) {
	// Must be UNIQUE
	if (this.index_reactions.hasOwnProperty(r.id)) return;
	this.index_reactions[r.id] = r;
	this.reactions.push(r);

	if (consume) this.consumers.push(r);
	else {
		this.producers.push(r);
	}
}

Metabolite.prototype.updateSubsystem = function() {
	let t = {};
	for (var i=0; i<this.producers.length; i++) {
		if (!t.hasOwnProperty(this.producers[i].subsystem)) t[this.producers[i].subsystem] = 1;
		else t[this.producers[i].subsystem]++;
	}

	for (var x in t) {
		t[x] /= this.producers.length;
	}

	this.producer_subsystems = t;

	t = {};
	for (var i=0; i<this.consumers.length; i++) {
		if (!t.hasOwnProperty(this.consumers[i].subsystem)) t[this.consumers[i].subsystem] = 1;
		else t[this.consumers[i].subsystem]++;
	}

	for (var x in t) {
		t[x] /= this.consumers.length;
	}

	this.consumer_subsystems = t;
}

module.exports = Metabolite;

