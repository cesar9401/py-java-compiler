import { Instruction } from "../instruction";
import { Operation } from "./operation";

export class Case {
	line: number;
	column: number;
	instructions: Instruction[];
	operation?: Operation;

	constructor(line: number, column: number, instructions: Instruction[], operation?: Operation) {
		this.line = line;
		this.column = column;
		this.instructions = instructions;
		this.operation = operation;
	}
}
