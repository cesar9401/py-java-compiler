import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { OperationJV } from "./operation_jv";
import { Variable } from "src/instruction/c/variable";
import { Error, TypeE } from "src/control/error";
import { Quadruple } from "src/table/quadruple";
import { OperationType } from "src/instruction/c/operation";

export class PrintJV extends Instruction {
	println: boolean;
	operations: OperationJV [];

	constructor(line: number, column: number, println: boolean, operations: OperationJV[]) {
		super(line, column);
		this.println = println;
		this.operations = operations;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
