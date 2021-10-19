import { Instruction } from "src/instruction/instruction";
import { IfJV } from "./if_jv";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Variable } from "src/instruction/c/variable";
import { QuadHandler } from "src/control/quad_handler";
import { OperationJV } from "./operation_jv";
import { Error, TypeE } from 'src/control/error';
import { OperationType } from "src/instruction/c/operation";

export class IfInstructionJV extends Instruction {
	instructions: IfJV[];

	constructor(line: number, column: number, instructions: IfJV[]) {
		super(line, column);
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
