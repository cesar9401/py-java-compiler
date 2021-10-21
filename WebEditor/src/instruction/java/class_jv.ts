import { Instruction } from "../instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { OperationType } from "src/instruction/c/operation";
import { Variable } from "src/instruction/c/variable";
import { OperationJV } from "./operation_jv";
import { Error, TypeE } from "src/control/error";
import { StatementJV } from "./statement_jv";

export class ClassJV extends Instruction {
	id: string;
	extends_: string;
	items: Instruction[];

	constructor(
		line: number,
		column: number,
		id: string,
		extends_: string,
		items: Instruction[]
	) {
		super(line, column);
		this.id = id;
		this.extends_ = extends_;
		this.items = items;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		/* clase actual */
		sm.setClazz = this.id;

		/* crear tabla de simbolos de la clase */
		sm.push(`class_${this.id}`);
		const local = new SymbolTable(sm.peek(), table);
		sm.pushTable(local);

		/* tabla de la clase actual */
		sm.setClassTable = local;

		/* verificar asignaciones de variables */
		for(const instruction of this.items) {
			if(instruction instanceof StatementJV) {
				instruction.run(local, sm);
			}
		}

		/* verificar constructores y metodos */
		for(const instruction of this.items) {
			if(!(instruction instanceof StatementJV)) {
				instruction.run(local, sm);
			}
		}

		sm.pop(); // eliminar scope de la clase
		sm.setClassTable = undefined; // quitar tabla de la clase
		sm.setClazz = undefined; // clase actual
	}

	generate(qh: QuadHandler) {
		// console.log(`class ${this.id}`);
		qh.push();

		/* tabla de la clase */
		qh.getSM.setClassTable = qh.peek();

		for(const instruction of this.items) {
			if(!(instruction instanceof StatementJV)) {
				instruction.generate(qh);
			}
		}

		/* eliminar tabla de la clase */
		qh.getSM.setClassTable = undefined;

		qh.pop();
	}
}
