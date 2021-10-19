import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "src/instruction/c/variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from 'src/control/error';
import { QuadHandler } from "src/control/quad_handler";
import { OperationType } from "src/instruction/c/operation";
import { OperationJV } from "./operation_jv";

export class ParamJV extends Instruction {
	type: OperationType;
	id: string;

	constructor(line: number, column: number, type: OperationType, id: string) {
		super(line, column);
		this.type = type;
		this.id = id;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
