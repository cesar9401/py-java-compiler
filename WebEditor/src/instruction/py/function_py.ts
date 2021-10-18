import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { CodeBlock } from "src/control/code_block";

export class FunctionPY extends Instruction {
	id: string;
	params: string[];
	instructions: Instruction[];

	constructor(
		line: number,
		column: number,
		id: string,
		params: string[],
		instructions: Instruction[]
	) {
		super(line, column);
		this.id = id;
		this.params = params;
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		sm.push(`def_${this.id}`);
		const local = new SymbolTable(sm.peek(), table);
		sm.pushTable(local);

		for(const ins of this.instructions) {
			ins.run(local, sm);
		}

		sm.pop(); // eliminar scope de function

		// agregar funcion
		const functionId = `__py__${this.id}__`;
		sm.addFunction(functionId);
	}

	generate(qh: QuadHandler) {
		qh.push();
		qh.setVoid(qh.peek());
		this.instructions.forEach(i => i.generate(qh));
		qh.pop();

		qh.addCodeBlock(new CodeBlock(`__py__${this.id}__`, qh.getQuads));
		qh.cleanQuads();
	}
}