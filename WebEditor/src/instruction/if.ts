import { Instruction } from "./instruction";

export class If {
	line:number;
	column:number;
	type:string;
	condition?:Instruction;
	instructions:Instruction[]

	constructor(
		line:number,
		column:number,
		type:string,
		instructions:Instruction[],
		condition?:Instruction
	) {
		this.line = line;
		this.column = column;
		this.type = type;
		this.instructions = instructions;
		this.condition = condition;
	}
}
