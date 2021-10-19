import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "src/instruction/c/variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from 'src/control/error';
import { QuadHandler } from "src/control/quad_handler";
import { OperationType } from "src/instruction/c/operation";
import { OperationJV } from "./operation_jv";

export class AssignmentJV extends Instruction {
	ths: boolean;
	id: string;
	operation: OperationJV;

	constructor(line: number, column: number, ths: boolean, id: string, operation: OperationJV) {
		super(line, column);
		this.ths = ths;
		this.id = id;
		this.operation = operation;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
