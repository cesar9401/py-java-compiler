import { Instruction } from "./instruction";
import { If } from "./if";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";

export class IfInstruction extends Instruction {
	instructions:If[];

	constructor(line:number, column:number, instructions:If[]) {
		super(line, column);
		this.instructions = instructions;
	}

	run(table: SymbolTable){}

	generate(quads: Quadruple[]) {
	}
}