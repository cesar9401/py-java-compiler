import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { OperationType } from "src/instruction/c/operation";
import { Error, TypeE } from "src/control/error";
import { Variable } from "src/instruction/c/variable";
import { AssignmentJV } from "./assignment_jv";
import { StatementJV } from "./statement_jv";
import { OperationJV } from "./operation_jv";

export class ForJV extends Instruction {
	init?: StatementJV;
	init1?: AssignmentJV;
	condition: OperationJV;
	assign: AssignmentJV;
	instructions: Instruction[];

	constructor(
		line: number,
		column: number,
		condition: OperationJV,
		assign: AssignmentJV,
		instructions: Instruction[],
		init?: StatementJV,
		init1?: AssignmentJV
	) {
		super(line, column);
		this.condition = condition;
		this.assign = assign;
		this.instructions = instructions;
		this.init = init;
		this.init1 = init1;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
