import { Instruction } from "src/instruction/instruction";
import { OperationPY } from "./operation_py";

export class IfPY {
	line: number;
	column: number;
	type: string;
	instructions: Instruction[];
	condition?: OperationPY;

	constructor(
		line: number,
		column: number,
		type: string,
		instructions: Instruction[],
		condition?: OperationPY
	) {
		this.line = line;
		this.column = column;
		this.type = type;
		this.instructions = instructions;
		this.condition = condition;
	}
}
