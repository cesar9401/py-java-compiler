import { QuadHandler } from "src/control/quad_handler";
import { SemanticHandler } from "src/control/semantic_handler";
import { SymbolTable } from "src/table/symbolTable";
import { Instruction } from "../instruction";

export class Include extends Instruction {
	type: string;
	dir: string[];
	all: boolean;

	constructor(
		line: number,
		column: number,
		type: string,
		dir: string[],
		all: boolean
	) {
		super(line, column);
		this.type = type;
		this.dir = dir;
		this.all = all;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
