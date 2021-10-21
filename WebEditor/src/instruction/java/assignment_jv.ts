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
			const desc = `Esta intentado asignar un valor de tipo '${value.type}' a una variable de tipo '${val.type}'`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}

		val.value = ' ';
	}

	generate(qh: QuadHandler) {
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

				let variable;
				if(this.ths) {
					/* obtener variable en la clase padre */
					variable = qh.getSM.getClassTable?.getById(this.id);

					/* asignacion a variable que esta en el heap */
					this.assignBooleanToHeap(qh, variable, lt, lf, final);
					return;

				} else {
					variable = qh.peek().getById(this.id);
					if(variable) {
						if(variable.pos !== undefined) {
							/* asignacion a variable en el stack */
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
					} else {
						/* obtener variable en la clase padre */
						variable = qh.getSM.getClassTable?.getById(this.id);

						/* asignacion a variable que esta en el heap */
						this.assignBooleanToHeap(qh, variable, lt, lf, final);

					}
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
				let val;
				if(this.ths) {
					/* obtener variable en la clase padre */
					val = qh.getSM.getClassTable?.getById(this.id);

					/* asignacion a variable que esta en el heap */
					this.assignNotToHeap(qh, val, lt1, lf1, final1);

				} else {
					val = qh.peek().getById(this.id);
					if(val) {
						if(val.pos !== undefined) {
							/* asignacion a variable en el stack */
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
					} else {
						/* obtener variable en la clase padre */
						val = qh.getSM.getClassTable?.getById(this.id);

						/* asignacion a variable que esta en el heap */
						this.assignNotToHeap(qh, val, lt1, lf1, final1);
					}
				}
				return;
		}

		if(res) {
			let variable;
			if(this.ths) {
				variable = qh.getSM.getClassTable?.getById(this.id);

				/* asignacion de variable en el heap */
				this.assignValueToHeap(qh, variable, res);

			} else {
				/* asignacion de variable en el stack */
				variable = qh.peek().getById(this.id);

				if(variable) {
					if(variable.pos !== undefined && res.type) {
						/* asignacion de variable con referencia en stack */
						const t1 = qh.getTmp();
						const t2 = qh.getTmp();
						const dest = this.getNameStack(res.type);
						qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t1, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, "", t2, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", res.result, "", `${dest[2]}[${t2}]`));
					}

				} else {
					variable = qh.getSM.getClassTable?.getById(this.id);

					/* asignacion de variable en el heap */
					this.assignValueToHeap(qh, variable, res);
				}
			}
		}
	}

	private getNameStack(type: OperationType) {
		switch(type) {
			case OperationType.INT:
			case OperationType.BOOL:
			return [`stack_n[ptr_n]`, `ptr_n`, `stack_n`];
			case OperationType.FLOAT:
				return [`stack_f[ptr_f]`, `ptr_f`, `stack_f`];
			case OperationType.STRING:
				return [`stack_s[ptr_s]`, `ptr_s`, `stack_s`];
			case OperationType.CHAR:
				return [`stack_c[ptr_c]`, `ptr_c`, `stack_c`];
		}
		return [];
	}

	/* asignar valores al ehap */
	private assignValueToHeap(qh: QuadHandler, variable: Variable | undefined, res: Quadruple) {
		/* asignacion de variable en el heap */
		if(variable && variable.pos !== undefined) {
			if(res.type) {
				const dest = this.getNameStack(res.type);
				const tt1 = qh.getTmp();
				const tt2 = qh.getTmp();
				const tt3 = qh.getTmp();
				const tt4 = qh.getTmp();

				/* obtener puntero en el heap en el stack */
				qh.addQuad(new Quadruple("PLUS", "ptr", "0", tt1, OperationType.INT));
				qh.addQuad(new Quadruple("ASSIGN", `stack[${tt1}]`, '', tt2, OperationType.INT));
				/* obtener posicion de la variable en el heap */
				qh.addQuad(new Quadruple("PLUS", tt2, variable.pos.toString(), tt3, OperationType.INT));
				// obtener posicion en stack_n en el heap
				qh.addQuad(new Quadruple("ASSIGN", `heap[${tt3}]`, '', tt4, OperationType.INT));
				qh.addQuad(new Quadruple("ASSIGN", res.result, "", `${dest[2]}[${tt4}]`));
			}
		}
	}

	/* asignar variable booleana(comparaciones, and, or) al heap */
	private assignBooleanToHeap(qh: QuadHandler, variable: Variable | undefined, lt: string, lf: string, final: string) {
		if(variable && variable.pos !== undefined) {
			qh.addQuad(new Quadruple("LABEL", "", "", lt));
			const tt1 = qh.getTmp();
			const tt2 = qh.getTmp();
			const tt3 = qh.getTmp();
			const tt4 = qh.getTmp();

			/* obtener puntero en el heap en el stack */
			qh.addQuad(new Quadruple("PLUS", "ptr", "0", tt1, OperationType.INT));
			qh.addQuad(new Quadruple("ASSIGN", `stack[${tt1}]`, '', tt2, OperationType.INT));
			/* obtener posicion de la variable en el heap */
			qh.addQuad(new Quadruple("PLUS", tt2, variable.pos.toString(), tt3, OperationType.INT));
			// obtener posicion en stack_n en el heap
			qh.addQuad(new Quadruple("ASSIGN", `heap[${tt3}]`, '', tt4, OperationType.INT));
			qh.addQuad(new Quadruple("ASSIGN", "1", "", `stack_n[${tt4}]`)); // asignar 1
			qh.addQuad(new Quadruple("GOTO", "", "", final));

			qh.addQuad(new Quadruple("LABEL", "", "", lf));
			const t1 = qh.getTmp();
			const t2 = qh.getTmp();
			const t3 = qh.getTmp();
			const t4 = qh.getTmp();
			/* obtener puntero en el heap en el stack */
			qh.addQuad(new Quadruple("PLUS", "ptr", "0", t1, OperationType.INT));
			qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, '', t2, OperationType.INT));
			/* obtener posicion de la variable en el heap */
			qh.addQuad(new Quadruple("PLUS", t2, variable.pos.toString(), t3, OperationType.INT));
			// obtener posicion en stack_n en el heap
			qh.addQuad(new Quadruple("ASSIGN", `heap[${t3}]`, '', t4, OperationType.INT));
			qh.addQuad(new Quadruple("ASSIGN", "0", "", `stack_n[${t4}]`)); // asignar 1

			qh.addQuad(new Quadruple("LABEL", "", "", final));
		}
	}

	/* asignar operacion de tipo not al heap */
	private assignNotToHeap(qh: QuadHandler, val: Variable | undefined, lt1: string, lf1: string, final1: string) {
		if(val && val.pos !== undefined) {
			qh.addQuad(new Quadruple("LABEL", "", "", lt1));
			const tt1 = qh.getTmp();
			const tt2 = qh.getTmp();
			const tt3 = qh.getTmp();
			const tt4 = qh.getTmp();

			/* obtener puntero en el heap en el stack */
			qh.addQuad(new Quadruple("PLUS", "ptr", "0", tt1, OperationType.INT));
			qh.addQuad(new Quadruple("ASSIGN", `stack[${tt1}]`, '', tt2, OperationType.INT));
			/* obtener posicion de la variable en el heap */
			qh.addQuad(new Quadruple("PLUS", tt2, val.pos.toString(), tt3, OperationType.INT));
			// obtener posicion en stack_n en el heap
			qh.addQuad(new Quadruple("ASSIGN", `heap[${tt3}]`, '', tt4, OperationType.INT));
			qh.addQuad(new Quadruple("ASSIGN", "0", "", `stack_n[${tt4}]`)); // asignar 0

			qh.addQuad(new Quadruple("GOTO", "", "", final1));
			qh.addQuad(new Quadruple("LABEL", "", "", lf1));

			const t1 = qh.getTmp();
			const t2 = qh.getTmp();
			const t3 = qh.getTmp();
			const t4 = qh.getTmp();
			/* obtener puntero en el heap en el stack */
			qh.addQuad(new Quadruple("PLUS", "ptr", "0", t1, OperationType.INT));
			qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, '', t2, OperationType.INT));
			/* obtener posicion de la variable en el heap */
			qh.addQuad(new Quadruple("PLUS", t2, val.pos.toString(), t3, OperationType.INT));
			// obtener posicion en stack_n en el heap
			qh.addQuad(new Quadruple("ASSIGN", `heap[${t3}]`, '', t4, OperationType.INT));
			qh.addQuad(new Quadruple("ASSIGN", "1", "", `stack_n[${t4}]`)); // asignar 1

			qh.addQuad(new Quadruple("LABEL", "", "", final1));
		}
	}
}
