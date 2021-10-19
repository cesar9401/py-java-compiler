import { Instruction } from "src/instruction/instruction";
import { OperationType } from "src/instruction/c/operation";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "src/instruction/c/variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { Error, TypeE } from "src/control/error";

export class OperationJV extends Instruction {
	type: OperationType;
	left?: OperationJV;
	right?: OperationJV;
	variable?: Variable;

	public constructor(...args: Array<any>) {
		if(args.length === 4) {
			super(args[0], args[1]);
			this.type = args[2];
			this.variable = args[3];
		} else {
			super(args[0], args[1]);
			this.type = args[2];
			this.left = args[3];
			this.right = args[4];
		}
	}

	run(table: SymbolTable, sm: SemanticHandler) {}
	generate(qh: QuadHandler) {}
}
