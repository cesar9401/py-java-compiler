import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { Case } from "./case";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";

export class Switch extends Instruction {
	operation: Instruction;
	cases: Case[];

	constructor(line: number, column: number, operation: Instruction, cases: Case[]) {
		super(line, column);
		this.operation = operation;
		this.cases = cases;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}

	generate(qh: QuadHandler){}
}
