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
import { ConstructorJV } from "./constructor_jv";
import { MethodJV } from "./method_jv";
import { Type } from "@angular/core";

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
		sm.setClazz = this;
		/* verificar que la clase no exista */
		const tmp = sm.getClass(this.id);
		if(tmp) {
			/* error la clase ya existe */
			const desc = `La clase con identificador '${this.id}' ya ha sido definida, intente con otro identificador.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		} else {
			sm.getClasses.push(this);
		}

		/* crear tabla de simbolos de la clase */
		sm.push(`class_${this.id}`);
		const local = new SymbolTable(sm.peek(), table);
		sm.pushTable(local);

		/* tabla de la clase actual */
		sm.setClassTable = local;

		/* arreglo con listado de constructores/metodos */
		sm.setMethods = [];

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
		qh.push();/* tabla local */

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

	/* obtener constructor segun firma */
	getConstructor(signature: string): ConstructorJV | undefined {
		for(const instruction of this.items) {
			if(instruction instanceof ConstructorJV) {
				if(instruction.getSignature() === signature) {
					return instruction;
				}
			}
		}
		return;
	}

	/* obtener metodo segun firma */
	getMethod(signature: string): MethodJV | undefined {
		for(const instruction of this.items) {
			if(instruction instanceof MethodJV) {
				if(instruction.getSignature() === signature) {
					return instruction;
				}
			}
		}
		return;
	}
}
