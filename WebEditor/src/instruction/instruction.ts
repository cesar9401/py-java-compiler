import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
export abstract class Instruction {
	line: number
	column: number

	constructor(line: number, column: number) {
		this.line = line;
		this.column = column;
	}

	abstract run(table: SymbolTable): any;

	abstract generate(quads: Quadruple[]): any;
}
