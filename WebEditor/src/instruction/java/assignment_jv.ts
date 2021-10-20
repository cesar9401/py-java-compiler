import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "src/instruction/c/variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from 'src/control/error';
import { QuadHandler } from "src/control/quad_handler";
import { OperationType } from "src/instruction/c/operation";
import { OperationJV } from "./operation_jv";

export class AssignmentJV extends Instruction {
	ths: boolean;
	id: string;
	operation: OperationJV;

	constructor(line: number, column: number, ths: boolean, id: string, operation: OperationJV) {
		super(line, column);
		this.ths = ths;
		this.id = id;
		this.operation = operation;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		/* verificar si es this.id */
		let val;
		if(this.ths && sm.getClassTable) {
			val = sm.getClassTable.getById(this.id);
		} else {
			val = table.getById(this.id);
			if(!val) {
				val = sm.getClassTable?.getById(this.id);
			}
		}

		/* error la variable no existe */
		if(!val) {
			const desc = `La variable con identificador '${this.id}' no existe, no es posible realizar la asignacion.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		const value: Variable | undefined = this.operation.run(table, sm);
		/* se esta asignando un valor nulo */
		if(!value || !value.value) {
			const desc = `Se esta intendo asignar un valor nulo a la variable '${this.id}' probablemente uno de los operadores no tiene un valor definido o no ha sido declarado.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		if(val.type !== value.type) {
			const desc = `Se esta intendo asignar un valor nulo a la variable '${this.id}' probablemente uno de los operadores no tiene un valor definido o no ha sido declarado.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		val.value = ' ';
	}

	generate(qh: QuadHandler) {}
}
