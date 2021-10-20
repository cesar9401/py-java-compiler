import { Instruction } from "../instruction";
import { Variable } from 'src/instruction/c/variable';
import { OperationType } from "src/instruction/c/operation";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from "src/control/error";
import { QuadHandler } from "src/control/quad_handler";
import { OperationJV } from "src/instruction/java/operation_jv";

export class StatementJV extends Instruction {
	access: string;
	type: OperationType;
	id: string;
	operation?: OperationJV;
	clazz: boolean;

	constructor(
		line: number,
		column: number,
		access: string,
		type: OperationType,
		id: string,
		operation?: OperationJV
	) {
		super(line, column);
		this.access = access;
		this.type = type;
		this.id = id;
		this.operation = operation;

		this.clazz = false;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		/* declaracion y asignacion */
		if(this.operation) {
			const value: Variable | undefined = this.operation.run(table, sm);
			if(value) {

				/* revisar que el tipo de variable coincida con el tipo declarado */
				if(this.type === value.type) {
					const newVal: Variable = new Variable(this.type, this.id, ' ');
					newVal.access = this.access; // acceso segun declaracion en variables de clase

					if(!table.contains(this.id)) {
						table.add(newVal);
					} else {
						/* error la variable ya existe */
						const desc = `La variable con identificador '${this.id}', ya existe, intente con un nombre distinto.`;
						const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
						sm.errors.push(error);
					}

				} else {
					const desc = `Esta intentado asignar una valor de tipo '${value.type}' a una variable de tipo '${this.type}'`;
					const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				}

			} else {
				/* error, no tiene valor definido */
				const desc = `Se esta intendo asignar un valor nulo a la variable '${this.id}' probablemente uno de los operadores no tiene un valor definido o no ha sido declarado.`;
				const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			}
		} else {

			/* solo declaracion de variables */
			const value = new Variable(this.type, this.id, undefined);
			if(!table.contains(this.id)) {
				if(this.clazz) {
					value.value = ' '; // darle un valor por defecto a variable de clase
				}
				table.add(value);
			} else {
				/* error la variable ya existe */
				const desc = `La variable con identificador '${this.id}', ya existe, intente con un nombre distinto.`;
				const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			}
		}
	}

	generate(qh: QuadHandler) {}
}
