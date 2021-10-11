import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";

export class FunctionPY extends Instruction {
	id: string;
	params: string[];
	instructions: Instruction[];

	constructor(
		line: number,
		column: number,
		id: string,
		params: string[],
		instructions: Instruction[]
	) {
		super(line, column);
		this.id = id;
		this.params = params;
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
