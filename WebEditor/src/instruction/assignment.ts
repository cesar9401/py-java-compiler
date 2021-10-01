import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "./variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from '../control/error';

export class Assignment extends Instruction {
	id: string;
	operation: Instruction;

	constructor(line:number, column:number, id:string, operation:Instruction) {
		super(line, column);
		this.id = id;
		this.operation = operation;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		const val = table.getById(this.id);

		if(!val) {
			// error la variable no existe
			const desc = `La variable con identificador '${this.id}' no existe, no es posible realizar la asignacion.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		const value :Variable = this.operation.run(table, sm);
		if((value && !value.value) || !value) {
			// error, la variable no existe o no tiene un valor definido
			const desc = `Se esta intendo asignar un valor nulo a la variable '${this.id}' probablemente uno de los operadores no tiene un valor definido o no ha sido declarado.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		// se consideran solo casos c y java
		if(val.type !== value.type) {
			// error, las variablse no son del mismo tipo
			const desc = `La variable '${this.id}' es de tipo '${val.type}' y se esta intentando asignar una variable de tipo '${value.type}'`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		// asignar variable
		// val.value = '';
		val.value = value.value;
	}

	generate(quads: Quadruple[]) {
	}
}
