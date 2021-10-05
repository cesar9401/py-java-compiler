import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "./variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from '../control/error';
import { QuadHandler } from "src/control/quad_handler";
import { Operation, OperationType } from "./operation";

export class Assignment extends Instruction {
	id: string;
	operation: Operation;

	constructor(line:number, column:number, id:string, operation:Operation) {
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

		const value :Variable | undefined = this.operation.run(table, sm);
		if((value && !value.value) || !value) {
			// error, la variable no existe o no tiene un valor definido
			const desc = `Se esta intendo asignar un valor nulo a la variable '${this.id}' probablemente uno de los operadores no tiene un valor definido o no ha sido declarado.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		if(val.type !== value.type) {
			// error, las variablse no son del mismo tipo

			// se consideran solo casos java
			// const desc = `La variable '${this.id}' es de tipo '${val.type}' y se esta intentando asignar una variable de tipo '${value.type}'`;
			// const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			// sm.errors.push(error);
			// return;
		}

		// asignar variable
		// val.value = value.value;
		val.value = ' ';
		// console.log(val);
	}

	generate(qh: QuadHandler): Quadruple | undefined {
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

		if(res) {
			const quad: Quadruple = new Quadruple('ASSIGN', res.result, "", this.id);
			qh.addQuad(quad);
			return quad;
		}
		return;
	}
}
