import { Instruction } from "src/instruction/instruction";
import { OperationJV } from "src/instruction/java/operation_jv";

export class CaseJV {
	line: number;
	column: number;
	instructions: Instruction[];
	operation?: OperationJV;

	constructor(line: number, column: number, instructions: Instruction[], operation?: OperationJV) {
		this.line = line;
		this.column = column;
		this.instructions = instructions;
		this.operation = operation;
	}
}
