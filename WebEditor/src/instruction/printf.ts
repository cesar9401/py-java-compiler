import { Instruction } from "./instruction";
import { Operation } from "./operation";
import { Variable } from "./variable";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";

export class Printf extends Instruction {
	format: string;
	operations?: Operation[];

	constructor(line:number, column:number, format:string, operations?:Operation[]) {
		super(line, column);
		this.format = format;
		this.operations = operations;
	}

	run(table: SymbolTable, sm: SemanticHandler){}

	generate(quads: Quadruple[]) {
	}
}



