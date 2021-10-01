import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
export abstract class Instruction {
	line: number
	column: number

	constructor(line: number, column: number) {
		this.line = line;
		this.column = column;
	}

	abstract run(table: SymbolTable, sm: SemanticHandler): any;

	abstract generate(quads: Quadruple[]): any;
}
