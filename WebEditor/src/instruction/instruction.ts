import { SymbolTable } from "src/table/symbolTable";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";

export abstract class Instruction {
	line: number
	column: number

	constructor(line: number, column: number) {
		this.line = line;
		this.column = column;
	}

	// abstract getName(): string;

	abstract run(table: SymbolTable, sm: SemanticHandler): any;

	abstract generate(qh: QuadHandler): any;
}
