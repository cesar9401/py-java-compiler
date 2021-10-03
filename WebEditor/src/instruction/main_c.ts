import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";

export class Main extends Instruction {
	instructions:Instruction[];

	constructor(line:number, column:number, instructions:Instruction[]) {
		super(line, column);
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		const local = new SymbolTable();
		local.addAll(table.getTable());

		for(const ins of this.instructions) {
			ins.run(table, sm);
		}
	}

	generate(qh: QuadHandler) {
		this.instructions.forEach(ins => ins.generate(qh));
	}
}
