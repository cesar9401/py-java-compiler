import { Instruction } from "src/instruction/instruction";
import { OperationJV } from "src/instruction/java/operation_jv";

export class IfJV {
	line: number;
	column: number;
	type: string;
	instructions: Instruction[];
	condition?: OperationJV;

	constructor(
		line: number,
		column: number,
		type: string,
		instructions: Instruction[],
		condition?: OperationJV
	) {
		this.line = line;
		this.column = column;
		this.type = type;
		this.instructions = instructions;
		this.condition = condition;
	}
}
