import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";

export class Main extends Instruction {
	instructions:Instruction[];

	constructor(line:number, column:number, instructions:Instruction[]) {
		super(line, column);
		this.instructions = instructions;
	}

	run(table: SymbolTable) {
		const local = new SymbolTable();
		local.addAll(table.getTable());

		for(const ins of this.instructions) {
			ins.run(table);
		}
	}

	generate(quads: Quadruple[]) {
	}
}
