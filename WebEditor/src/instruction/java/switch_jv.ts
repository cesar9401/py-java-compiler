import { Instruction } from "../instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { OperationType } from "src/instruction/c/operation";
import { Variable } from "src/instruction/c/variable";
import { OperationJV } from "./operation_jv";
import { Error, TypeE } from "src/control/error";
import { CaseJV } from "./case_jv";

export class SwitchJV extends Instruction {
	operation: OperationJV;
	cases: CaseJV[];

	constructor(line: number, column: number, operation: OperationJV, cases: CaseJV[]) {
		super(line, column);
		this.operation = operation;
		this.cases = cases;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
