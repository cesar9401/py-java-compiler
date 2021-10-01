import { Instruction } from "./instruction";

export class Case {
	line: number;
	column: number;
	instructions: Instruction[];
	operation?: Instruction;

	constructor(line: number, column: number, instructions: Instruction[], operation?: Instruction) {
		this.line = line;
		this.column = column;
		this.instructions = instructions;
		this.operation = operation;
	}
}
