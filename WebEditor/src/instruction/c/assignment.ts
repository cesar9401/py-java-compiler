import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "./variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from '../../control/error';
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

		if(value.type === OperationType.STRING) {
			// error, las variablse no son del mismo tipo

			// se consideran solo casos java
			const desc = `La variable '${this.id}' es de tipo '${val.type}' y se esta intentando asignar una variable de tipo '${value.type}'`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
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

				// obtener puntero
				const variable = qh.peek().getById(this.id);
				if(variable && variable.pos !== undefined) {
					qh.addQuad(new Quadruple("LABEL", "", "", lt));

					const t = qh.getTmp();
					const sn = qh.getTmp();
					qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `stack[${t}]`, "", sn, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", "1", "", `stack_n[${sn}]`)); // asignar 1

					qh.addQuad(new Quadruple("GOTO", "", "", final));
					qh.addQuad(new Quadruple("LABEL", "", "", lf));

					const t1 = qh.getTmp();
					const sn1 = qh.getTmp();
					qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t1, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, "", sn1, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", "0", "", `stack_n[${sn1}]`)); // asignar 0

					qh.addQuad(new Quadruple("LABEL", "", "", final));
				}

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

				const val = qh.peek().getById(this.id);
				if(val && val.pos !== undefined) {
					qh.addQuad(new Quadruple("LABEL", "", "", lt1));

					const t1 = qh.getTmp();
					const sn1 = qh.getTmp();
					qh.addQuad(new Quadruple("PLUS", "ptr", val.pos.toString(), t1, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, "", sn1, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", "0", "", `stack_n[${sn1}]`)); // asignar 0

					qh.addQuad(new Quadruple("GOTO", "", "", final1));
					qh.addQuad(new Quadruple("LABEL", "", "", lf1));

					const t = qh.getTmp();
					const sn = qh.getTmp();
					qh.addQuad(new Quadruple("PLUS", "ptr", val.pos.toString(), t, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `stack[${t}]`, "", sn, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", "1", "", `stack_n[${sn}]`)); // asignar 1

					qh.addQuad(new Quadruple("LABEL", "", "", final1));
				}

				return;
		}

		if(res) {
			// hacer la operacion
			// obtener el puntero
			const variable = qh.peek().getById(this.id);
			if(variable && variable.pos !== undefined) {
				switch(variable.type) {
					case OperationType.INT:
						const t = qh.getTmp();
						const sn = qh.getTmp();
						qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", `stack[${t}]`, "", sn, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", res.result, "", `stack_n[${sn}]`));
						return;
					case OperationType.FLOAT:
						const t1 = qh.getTmp();
						const sf = qh.getTmp();
						qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t1, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, "", sf, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", res.result, "", `stack_f[${sf}]`));
						return;
					case OperationType.CHAR:
						const t2= qh.getTmp();
						const sc = qh.getTmp();
						qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t2, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", `stack[${t2}]`, "", sc, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", res.result, "", `stack_c[${sc}]`));
						return;
				}
			}
		}
		return;
	}
}
