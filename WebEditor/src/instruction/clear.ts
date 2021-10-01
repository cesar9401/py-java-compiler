import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";

export class Clear extends Instruction {

	constructor(line: number, column: number) {
		super(line, column);
	}

	run(table: SymbolTable) {}

	generate(quads: Quadruple[]) {}
}
