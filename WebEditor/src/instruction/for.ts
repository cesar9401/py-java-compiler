import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { Assignment } from "./assignment";
import { Statement } from "./statement";
import { SemanticHandler } from "src/control/semantic_handler";

export class For extends Instruction {
	init?: Statement;
	init1?: Assignment;
	condition: Instruction;
	assign: Assignment;
	instructions: Instruction[];

	constructor(
		line: number,
		column: number,
		condition: Instruction,
		assign: Assignment,
		instructions: Instruction[],
		init?: Statement,
		init1?: Assignment,) {
		super(line, column);
		this.condition = condition;
		this.assign = assign;
		this.instructions = instructions;

		if(init) {
			this.init = init;
		} else if(init1) {
			this.init1 = init1;
		}
	}

	run(table: SymbolTable, sm: SemanticHandler){}

	generate(quads: Quadruple[]) {}
}
