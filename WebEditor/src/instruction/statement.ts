import { Instruction } from "./instruction";
import { Variable } from './variable';
import { OperationType } from "./operation";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from "src/control/error";

export class Statement extends Instruction {
	cnst: boolean;
	type: OperationType;
	id: string;
	operation?: Instruction

	constructor(
		line: number,
		column: number,
		cnst: boolean,
		type: OperationType,
		id: string,
		operation?: Instruction
	) {
		super(line, column);
		this.cnst = cnst;
		this.type = type;
		this.id = id;
		this.operation = operation;
	}

	run(table: SymbolTable, sm: SemanticHandler) {

		/* asignacion y declaracion */
		if(this.operation) {
			const value: Variable = this.operation.run(table, sm);
			if((value)) { // en este punto si existe value, significa que tiene un valor definido

				/* se asigna segun el tipo de variable declarada */
				// if(value.type === this.type) {
					const newVal: Variable = new Variable(this.type, this.id, ' '); // revisar statement
					newVal.cnst = this.cnst;

					if(!table.contains(this.id)) {
						// agregando a la tabla de simbolos
						table.add(newVal);
						// console.log(newVal);
						return;
					} else {
						// error la variable ya existe
						const desc = `La variable con identificador '${this.id}' ya existe, intente con un nombre distinto.`;
						const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
						sm.errors.push(error);
					}
				// } else {
				// 	const desc = `Esta intentado asignar una valor de tipo '${value.type}' a una variable de tipo '${this.type}'`;
				// 	const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
				// 	sm.errors.push(error);
				// }

			} else {
				// error se intenta asignar un valor no definido
				const desc = `Se esta intendo asignar un valor nulo a la variable '${this.id}' probablemente uno de los operadores no tiene un valor definido o no ha sido declarado.`;
				const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			}
		}

		// esto esta de mas xd
		if(!this.operation && this.cnst) {
			console.log(`Error, variable de tipo constante debe asignarse un valor`);
		}

		/* solo declaracion */
		if(!this.operation) {
			// agregar a tabla de simbolos, variable sin valor
			const value : Variable = new Variable(this.type, this.id, undefined);
			value.cnst = this.cnst;
			if(!table.contains(this.id)) {
				// console.log(value);
				table.add(value);
			} else {
				// error la variable ya existe
				const desc = `La variable con identificador '${this.id}', ya existe, intente con un nombre distinto.`;
				const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
			}
		}
	}

	generate(quads: Quadruple[]): Quadruple | undefined {
		if(this.operation) {
			const res: Quadruple = this.operation.generate(quads);
			// const result = "t" + (quads.length + 1);
			const quad: Quadruple = new Quadruple('ASSIGN', res.result, "", this.id);
			quads.push(quad);
			return quad;
		}

		return undefined;
	}
}
