import { Instruction } from "../instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";

export class Break extends Instruction {

	constructor(line:number, column: number) {
		super(line, column);
	}

	run(table: SymbolTable, sm: SemanticHandler) {}

	generate(qh: QuadHandler) {
		qh.addBreak(new Quadruple("GOTO", "", "", ""));
	}
}
