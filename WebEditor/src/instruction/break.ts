import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";

export class Break extends Instruction {

	constructor(line:number, column: number) {
		super(line, column);
	}

	run(table: SymbolTable, sm: SemanticHandler) {}

	generate(quads: Quadruple[]) {}
}
