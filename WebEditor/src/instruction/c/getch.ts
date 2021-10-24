import { Instruction } from "src/instruction/instruction";
import { QuadHandler } from "src/control/quad_handler";
import { Quadruple } from "src/table/quadruple";
import { SymbolTable } from "src/table/symbolTable";
import { SemanticHandler } from "src/control/semantic_handler";
import { OperationType } from "./operation";
import { Variable } from "./variable";

export class Getch extends Instruction {
	name: string

	constructor(line: number, column: number, name: string) {
		super(line, column);
		this.name = name;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		return new Variable(OperationType.CHAR, undefined, " ");
	}

	generate(qh: QuadHandler) {
		const len = qh.peek().length;
		qh.addQuad(new Quadruple("PLUS", "ptr", len.toString(), "ptr"));
		// activar getch aqui
		qh.addQuad(new Quadruple("FUNCTION", "", "", this.name));
		qh.addQuad(new Quadruple("MINUS", "ptr", len.toString(), "ptr"));

		/* recuperar valor leido por getch */
		const t1 = qh.getTmp();
		const t2 = qh.getTmp();
		const t3 = qh.getTmp();
		const t4 = qh.getTmp();
		const posR = "0";
		qh.addQuad(new Quadruple("PLUS", "ptr", len.toString(), t1, OperationType.INT));
		qh.addQuad(new Quadruple("PLUS", t1, posR, t2, OperationType.INT));
		qh.addQuad(new Quadruple("ASSIGN", `stack[${t2}]`, '', t3, OperationType.INT));
		const result = new Quadruple("ASSIGN", `stack_c[${t3}]`, '', t4, OperationType.CHAR);
		qh.addQuad(result);
		return result;
	}
}
