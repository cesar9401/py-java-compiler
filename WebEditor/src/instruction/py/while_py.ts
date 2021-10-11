import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Variable } from "src/instruction/c/variable";
import { QuadHandler } from "src/control/quad_handler";
import { OperationPY } from "./operation_py";

export class WhilePY extends Instruction {
	condition: OperationPY;
	instructions: Instruction[];

	constructor(line: number, column: number, condition: OperationPY, instructions: Instruction[]) {
		super(line, column);
		this.condition = condition;
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
