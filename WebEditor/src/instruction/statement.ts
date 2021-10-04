import { Instruction } from "./instruction";
import { Variable } from './variable';
import { OperationType } from "./operation";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from "src/control/error";
import { QuadHandler } from "src/control/quad_handler";
import { Operation } from "./operation";

export class Statement extends Instruction {
	cnst: boolean;
	type: OperationType;
	id: string;
	operation?: Operation

	constructor(
		line: number,
		column: number,
		cnst: boolean,
		type: OperationType,
		id: string,
		operation?: Operation
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
			const value: Variable | undefined = this.operation.run(table, sm);
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

	generate(qh: QuadHandler): Quadruple | undefined {

		if(this.operation) {
			const res: Quadruple | undefined = this.operation.generate(qh);
			switch(this.operation.type) {
				case OperationType.GREATER:
				case OperationType.SMALLER:
				case OperationType.GREATER_EQ:
				case OperationType.SMALLER_EQ:
				case OperationType.EQEQ:
				case OperationType.NEQ:

				case OperationType.AND:
				case OperationType.OR:
					const lt = qh.labelTrue ? qh.labelTrue : qh.getLabel();
					const lf = qh.labelFalse ? qh.labelFalse : qh.getLabel();
					const final = qh.getLabel();

					/* rivisar esto :v */
					qh.labelTrue = undefined;
					qh.labelFalse = undefined;

					qh.toTrue(lt);
					qh.toFalse(lf);
					qh.addQuad(new Quadruple("LABEL", "", "", lt));
					qh.addQuad(new Quadruple("ASSIGN", "1", "", this.id));
					qh.addQuad(new Quadruple("GOTO", "", "", final));
					qh.addQuad(new Quadruple("LABEL", "", "", lf));
					qh.addQuad(new Quadruple("ASSIGN", "0", "", this.id));
					qh.addQuad(new Quadruple("LABEL", "", "", final));

					return;

				case OperationType.NOT:
					const lt1 = qh.labelTrue ? qh.labelTrue : qh.getLabel();
					const lf1 = qh.labelFalse ? qh.labelFalse : qh.getLabel();
					const final1 = qh.getLabel();

					/* revisar esto */
					qh.labelTrue = undefined;
					qh.labelFalse = undefined;

					qh.toTrue(lf1);
					qh.toFalse(lt1);

					qh.addQuad(new Quadruple("LABEL", "", "", lt1));
					qh.addQuad(new Quadruple("ASSIGN", "0", "", this.id));
					qh.addQuad(new Quadruple("GOTO", "", "", final1));
					qh.addQuad(new Quadruple("LABEL", "", "", lf1));
					qh.addQuad(new Quadruple("ASSIGN", "1", "", this.id));
					qh.addQuad(new Quadruple("LABEL", "", "", final1));
					return;
			}

			// const res: Quadruple | undefined = this.operation.generate(qh);
			if(res) {
				const quad: Quadruple = new Quadruple('ASSIGN', res.result, "", this.id);
				qh.addQuad(quad);
				return quad;
			}
		}

		return undefined;
	}
}
