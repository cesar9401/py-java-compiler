import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "../c/variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { OperationPY } from "./operation_py";
import { QuadHandler } from "src/control/quad_handler";

export class AssignmentPY extends Instruction {
	ids: string[];
	values: OperationPY[];

	constructor(line: number, column: number, ids: string[], values: OperationPY[]) {
		super(line, column);
		this.ids = ids;
		this.values = values;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
