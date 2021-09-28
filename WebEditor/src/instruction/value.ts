import { Instruction } from "./instruction";
import { Variable } from './variable';
import { OperationType } from "./operation";

export class Value extends Instruction {
	type: OperationType;
	variable: Variable

	constructor(line: number, column: number, type: OperationType, variable: Variable) {
		super(line, column);
		this.type = type;
		this.variable = variable;
	}

	run() {
	}
}
