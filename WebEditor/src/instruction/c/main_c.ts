import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { IfInstruction } from "./if_instruction";

export class Main extends Instruction {
	instructions:Instruction[];

	constructor(line:number, column:number, instructions:Instruction[]) {
		super(line, column);
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		sm.push('main'); // agregar scope
		const local = new SymbolTable(sm.peek(), table);
		sm.pushTable(local);

		for(const ins of this.instructions) {
			ins.run(local, sm);
		}

		sm.pop(); // eliminar scope main

		/* revisar instrucciones break y continue */
		sm.checkAstProgram(this.instructions, true, true);
	}

	generate(qh: QuadHandler) {
		// obtener tabla de simbolos de main?
		qh.push();
		this.instructions.forEach(ins => ins.generate(qh));
		qh.pop();
	}
}
