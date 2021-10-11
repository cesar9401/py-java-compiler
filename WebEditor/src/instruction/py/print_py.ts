import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { OperationPY } from "./operation_py";

export class PrintPY extends Instruction {
	println: boolean;
	operations: OperationPY[];

	constructor(line: number, column: number, println: boolean, operations: OperationPY[]) {
		super(line, column);
		this.println = println;
		this.operations = operations;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
