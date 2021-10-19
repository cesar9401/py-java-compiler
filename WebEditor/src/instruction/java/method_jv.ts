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
import { ParamJV } from "./param_jv";

export class MethodJV extends Instruction {
	access: string;
	type: OperationType;
	id: string;
	params: ParamJV[];
	instructions: Instruction[];

	constructor(
		line: number,
		column: number,
		access: string,
		type: OperationType,
		id: string,
		params: ParamJV[],
		instructions: Instruction[]
	) {
		super(line, column);
		this.access = access;
		this.type = type;
		this.id = id;
		this.params = params;
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
