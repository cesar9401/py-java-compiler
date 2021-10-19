import { Instruction } from "../instruction";
import { Variable } from 'src/instruction/c/variable';
import { OperationType } from "src/instruction/c/operation";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from "src/control/error";
import { QuadHandler } from "src/control/quad_handler";
import { OperationJV } from "src/instruction/java/operation_jv";

export class StatementJV extends Instruction {
	access: string;
	type: OperationType;
	id: string;
	operation?: OperationJV;

	constructor(
		line: number,
		column: number,
		access: string,
		type: OperationType,
		id: string,
		operation?: OperationJV
	) {
		super(line, column);
		this.access = access;
		this.type = type;
		this.id = id;
		this.operation = operation;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
