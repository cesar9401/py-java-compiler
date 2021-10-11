import { Instruction } from "src/instruction/instruction";
import { QuadHandler } from "src/control/quad_handler";
import { Quadruple } from "src/table/quadruple";
import { SymbolTable } from "src/table/symbolTable";
import { SemanticHandler } from "src/control/semantic_handler";

export class Getch extends Instruction {
	name: string

	constructor(line: number, column: number, name: string) {
		super(line, column);
		this.name = name;
	}

	run(table: SymbolTable, sm: SemanticHandler) {}

	generate(qh: QuadHandler) {
		const len = qh.peek().length;
		qh.addQuad(new Quadruple("PLUS", "ptr", len.toString(), "ptr"));
		// activar getch aqui
		qh.addQuad(new Quadruple("FUNCTION", "", "", this.name));
		qh.addQuad(new Quadruple("MINUS", "ptr", len.toString(), "ptr"));
	}
}
