import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";

export class DoWhile extends Instruction {
	operation: Instruction;
	instructions: Instruction[];

	constructor(line: number, column: number, operation: Instruction, instructions: Instruction[]) {
		super(line, column);
		this.operation = operation;
		this.instructions = instructions;
	}

	run(table:SymbolTable, sm: SemanticHandler) {}

	generate(quads: Quadruple[]) {}
}
