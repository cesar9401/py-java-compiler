import { Instruction } from "./instruction";
import { Operation } from "./operation";

export class If {
	line:number;
	column:number;
	type:string;
	condition?:Operation;
	instructions:Instruction[]

	constructor(
		line:number,
		column:number,
		type:string,
		instructions:Instruction[],
		condition?:Operation
	) {
		this.line = line;
		this.column = column;
		this.type = type;
		this.instructions = instructions;
		this.condition = condition;
	}
}
