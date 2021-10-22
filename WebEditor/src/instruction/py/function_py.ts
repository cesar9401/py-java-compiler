import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { CodeBlock } from "src/control/code_block";
import { Error, TypeE } from 'src/control/error';

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
		const functionId = `__py__${this.id}__`;

		/* verficar que la funcion python no existe */
		const tmp = sm.getFunction(functionId);
		if(tmp) {
			const desc = `La funcion con identificador '${this.id}', ya ha sido definida.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		} else {
			/* agregar la funcion*/
			sm.getFunctions.push(this);
		}

		/* tabla de simbolos local */
		sm.push(`def_${this.id}`);
		const local = new SymbolTable(sm.peek(), table);
		sm.pushTable(local);

		for(const ins of this.instructions) {
			ins.run(local, sm);
		}

		sm.pop(); // eliminar scope de function
	}

	generate(qh: QuadHandler) {
		qh.push();
		qh.setVoid(qh.peek());
		this.instructions.forEach(i => i.generate(qh));
		qh.pop();

		qh.addCodeBlock(new CodeBlock(`__py__${this.id}__`, qh.getQuads));
		qh.cleanQuads();
	}

	getId() {
		return `__py__${this.id}__`;
	}
}
