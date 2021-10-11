import { Instruction } from "src/instruction/instruction";
import { IfPY } from "./if_py";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Variable } from "src/instruction/c/variable";
import { QuadHandler } from "src/control/quad_handler";

export class IfInstructionPY extends Instruction {
	instructions: IfPY[];

	constructor(line: number, column: number, instructions: IfPY[]) {
		super(line, column);
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
