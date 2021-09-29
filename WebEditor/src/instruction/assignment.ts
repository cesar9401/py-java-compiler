import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "./variable";
import { Quadruple } from "src/table/quadruple";

export class Assignment extends Instruction {
	id: string;
	operation: Instruction;

	constructor(line:number, column:number, id:string, operation:Instruction) {
		super(line, column);
		this.id = id;
		this.operation = operation;
	}

	run(table: SymbolTable) {
		const value :Variable = this.operation.run(table);
	}

	generate(quads: Quadruple[]) {
		
	}
}
