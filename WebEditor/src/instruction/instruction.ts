export abstract class Instruction {
	line: number
	column: number

	constructor(line: number, column: number) {
		this.line = line;
		this.column = column;
	}

	abstract run(): any;
}