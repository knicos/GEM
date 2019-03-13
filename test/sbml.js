const assert = require('assert');
const gem = require('../');

let model = `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level2" level="2" version="1">
    <model>
        <listOfUnitDefinitions>
        </listOfUnitDefinitions>
        <listOfCompartments>
            <compartment id="e" name="Extracellular"/>
            <compartment id="c" name="Cytosol"/>
        </listOfCompartments>
        <listOfSpecies>
			<species id="M_pep_c" name="Phosphoenolpyruvate" compartment="c">
                <notes>
                    <body xmlns="http://www.w3.org/1999/xhtml">
                        <p>CHARGE:-3</p>
                    </body>
                </notes>
            </species>
			<species id="M_skm5p_c" name="Shikimate 3-phosphate" compartment="c">
                <notes>
                    <body xmlns="http://www.w3.org/1999/xhtml">
                        <p>CHARGE:-3</p>
                    </body>
                </notes>
            </species>
			<species id="M_3psme_c" name="5-O-(1-Carboxyvinyl)-3-phosphoshikimate" compartment="c">
                <notes>
                    <body xmlns="http://www.w3.org/1999/xhtml">
                        <p>CHARGE:-4</p>
                    </body>
                </notes>
            </species>
			<species id="M_pi_c" name="Orthophosphate" compartment="c">
                <notes>
                    <body xmlns="http://www.w3.org/1999/xhtml">
                        <p>CHARGE:-2</p>
                    </body>
                </notes>
            </species>
        </listOfSpecies>
        <listOfReactions>
            <reaction id="R_PSCVTi" name="3-phosphoshikimate 1-carboxyvinyltransferase, irreversible">
                <notes>
                    <body xmlns="http://www.w3.org/1999/xhtml">
                        <p>GENE_ASSOCIATION:slr0444</p>
                        <p>SUBSYSTEM:Phenylalanine tyrosine and tryptophan biosynthesis</p>
                        <p>EC Number:2.5.1.19</p>
                        <p>Confidence Level:</p>
                        <p>AUTHORS:</p>
                        <p/>
                    </body>
                </notes>
                <listOfReactants>
                    <speciesReference species="M_pep_c" stoichiometry="1"/>
                    <speciesReference species="M_skm5p_c" stoichiometry="1"/>
                </listOfReactants>
                <listOfProducts>
                    <speciesReference species="M_3psme_c" stoichiometry="1"/>
                    <speciesReference species="M_pi_c" stoichiometry="1"/>
                </listOfProducts>
                <kineticLaw>
                    <math xmlns="http://www.w3.org/1998/Math/MathML">
                        <ci> FLUX_VALUE </ci>
                    </math>
                    <listOfParameters>
                        <parameter id="LOWER_BOUND" value="-999999" units="mmol_per_gDW_per_hr"/>
                        <parameter id="UPPER_BOUND" value="999999" units="mmol_per_gDW_per_hr"/>
                        <parameter id="FLUX_VALUE" value="0" units="mmol_per_gDW_per_hr"/>
                        <parameter id="OBJECTIVE_COEFFICIENT" value="0" units="mmol_per_gDW_per_hr"/>
                    </listOfParameters>
                </kineticLaw>
            </reaction>
        </listOfReactions>
    </model>
</sbml>`;

describe("Loading of SBML model", function() {
	it("loads an SBML string", function() {
		let m = gem.fromString(model);
		assert.ok(m);
	});

	it("can get metabolite by id", function() {
		let m = gem.fromString(model);
		assert.equal(m.getMetaboliteById("M_skm5p_c").name, "Shikimate 3-phosphate");
	});

	it("can get metabolite producers", function() {
		let m = gem.fromString(model);
		let p = m.metaboliteProducers("M_3psme_c");
		assert.equal(p.length, 1);
		assert.equal(p[0].id, "R_PSCVTi");
	});
});

