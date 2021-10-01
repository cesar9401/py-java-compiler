import { Instruction } from "./instruction";
import { If } from "./if";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";

export class IfInstruction extends Instruction {
	instructions:If[];

	constructor(line:number, column:number, instructions:If[]) {
		super(line, column);
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler){}

	generate(quads: Quadruple[]) {
	}
}