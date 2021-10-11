import { OperationType } from "../c/operation";
import { SymbolTable } from "src/table/symbolTable";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { Instruction } from "src/instruction/instruction";
import { Variable } from "../c/variable";

export class OperationPY extends Instruction {
	type: OperationType;
	left?: OperationPY;
	right?: OperationPY;
	variable?: Variable;

	public constructor(line: number, column: number, type: OperationType, variable: Variable);
	public constructor(line: number, column: number, type: OperationType, left: OperationPY, right?: OperationPY);

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

