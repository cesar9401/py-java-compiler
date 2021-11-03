import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "./variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from '../../control/error';
import { QuadHandler } from "src/control/quad_handler";
import { Operation, OperationType } from "./operation";
import { ArrayAccess } from "./array_access";

export class ArrayAssignment extends Instruction {
	array: ArrayAccess;
	operation: Operation;

	constructor(line: number, column: number, array: ArrayAccess, operation: Operation) {
		super(line, column);
		this.array = array;
		this.operation = operation;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		const val = table.getById(this.array.id);
		/* la variable no existe */
		if(!val) {
			const desc = `La variable con identificador '${this.array.id}' no existe, no es posible realizar la asignacion.`;
			const error = new Error(this.line, this.column, this.array.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		/* la variable no es de tipo arreglo */
		if(!val.isArray) {
			const desc = `La variable con identificador '${this.array.id}' no corresponde a una variable de tipo arreglo, no es posible realizar la asignacion.`;
			const error = new Error(this.line, this.column, this.array.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		/* el numero de dimensiones del arreglo no coinciden con las declaradas */
		if(val.size !== this.array.dimensions.length) {
			const desc = `El arreglo ${this.array.id} es de ${val.size} dimensiones, se esta intentado acceder con el numero de dimensiones incorrecto (${this.array.dimensions.length}).`;
			const error = new Error(this.line, this.column, this.array.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		} else {
			/* revisar que las operaciones que definen la dimension sean de tipo entero */
			for(const op of this.array.dimensions) {
				const tmp: Variable | undefined = op.run(table, sm);
				if(!tmp || !tmp.value) {
					const desc = `Se esta intentando acceder a una de las dimensiones del arreglo '${this.array.id}', con un valor nulo, probablemente uno de los operandos no tiene un valor definido o no ha sido declarado.`;
					const error = new Error(op.line, op.column, op.variable && op.variable.id ? op.variable.id : '', TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				} else if(tmp.type !== OperationType.INT) {
					const desc = `Se esta intentando acceder a una de las dimensiones del arreglo '${this.array.id}', con un valor de tipo '${tmp.type}', se esperaba un valor de tipo entero.`;
					const error = new Error(op.line, op.column, op.variable && op.variable.id ? op.variable.id : '', TypeE.SEMANTICO, desc);
					sm.errors.push(error);
				}
			}
		}

		/* la variable a asignar tiene un valor definido */
		const value: Variable | undefined = this.operation.run(table, sm);
		if(!value || !value.value) {
			const desc = `Se esta intendo asignar un valor nulo al arreglo '${this.array.id}' probablemente uno de los operadores no tiene un valor definido o no ha sido declarado.`;
			const error = new Error(this.line, this.column, this.operation.variable && this.operation.variable.id ? this.operation.variable.id : '', TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		/* la variable a asignar no es de tipo string */
		if(value.type === OperationType.STRING) {
			const desc = `El arreglo '${this.array.id}' es de tipo '${val.type}' y se esta intentando asignar una variable de tipo '${value.type}'`;
			const error = new Error(this.line, this.column, '', TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}
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

				const variable = qh.peek().getById(this.array.id);

				if(variable && variable.pos !== undefined) {
					const stack = this.getNameStack(variable.type);
					qh.addQuad(new Quadruple("LABEL", "", "", lt));
					const tt = this.getPos(qh);
					const t1 = qh.getTmp();
					const t2 = qh.getTmp();
					const t3 = qh.getTmp();

					qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t1, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, '', t2, OperationType.INT));
					qh.addQuad(new Quadruple("PLUS", t2, tt, t3, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", '1', '', `${stack[2]}[${t3}]`));

					qh.addQuad(new Quadruple("GOTO", "", "", final));
					qh.addQuad(new Quadruple("LABEL", "", "", lf));

					const ttt = this.getPos(qh);
					const tt1 = qh.getTmp();
					const tt2 = qh.getTmp();
					const tt3 = qh.getTmp();
					qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), tt1, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `stack[${tt1}]`, '', tt2, OperationType.INT));
					qh.addQuad(new Quadruple("PLUS", tt2, ttt, tt3, OperationType.INT));

					qh.addQuad(new Quadruple("ASSIGN", '0', '', `${stack[2]}[${tt3}]`));
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

				const val = qh.peek().getById(this.array.id);
				if(val && val.pos !== undefined) {
					const stack = this.getNameStack(val.type);
					qh.addQuad(new Quadruple("LABEL", "", "", lt1));

					const tt = this.getPos(qh);
					const t1 = qh.getTmp();
					const t2 = qh.getTmp();
					const t3 = qh.getTmp();

					qh.addQuad(new Quadruple("PLUS", "ptr", val.pos.toString(), t1, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, '', t2, OperationType.INT));
					qh.addQuad(new Quadruple("PLUS", t2, tt, t3, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", '0', '', `${stack[2]}[${t3}]`)); /* asignar falso */

					qh.addQuad(new Quadruple("GOTO", "", "", final1));
					qh.addQuad(new Quadruple("LABEL", "", "", lf1));

					const ttt = this.getPos(qh);
					const tt1 = qh.getTmp();
					const tt2 = qh.getTmp();
					const tt3 = qh.getTmp();
					qh.addQuad(new Quadruple("PLUS", "ptr", val.pos.toString(), tt1, OperationType.INT));
					qh.addQuad(new Quadruple("ASSIGN", `stack[${tt1}]`, '', tt2, OperationType.INT));
					qh.addQuad(new Quadruple("PLUS", tt2, ttt, tt3, OperationType.INT));

					qh.addQuad(new Quadruple("ASSIGN", '1', '', `${stack[2]}[${tt3}]`)); /* asignar true */
					qh.addQuad(new Quadruple("LABEL", "", "", final1));
				}

				return;
		}

		if(res) {
			const variable = qh.peek().getById(this.array.id); /* variable del arreglo */
			if(variable && variable.pos !== undefined) {
				/* variable.type => OperationType.INT */
				const stack = this.getNameStack(variable.type);

				let tt = this.getPos(qh);

				const t1 = qh.getTmp();
				const t2 = qh.getTmp(); /* puntero en ptr_n o segun sea el tipo donde inicia el arreglo */
				const t3 = qh.getTmp();
				qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t1, OperationType.INT));
				qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, '', t2, OperationType.INT));

				qh.addQuad(new Quadruple("PLUS", t2, tt, t3, OperationType.INT));

				/* asignar valor de res en res segun stack en posicion t3*/
				qh.addQuad(new Quadruple("ASSIGN", res.result, '', `${stack[2]}[${t3}]`));
			}
		}
	}

	private getPos(qh: QuadHandler) {
		let tt = '';
		if(this.array.dimensions.length > 1) {
			/* hacer los calculos para obtener la ubicacion en ptr_n o segun sea el caso donde se asignara el valor de this.operation */
			for(let i = 0; i < this.array.dimensions.length - 1; i++) {
				if(i === 0) {
					const dim = qh.peek().getById(`${this.array.id}[${i + 1}]`);
					const tmp = qh.getTmp();
					const tmp1 = qh.getTmp();
					if(dim && dim.pos !== undefined) {
						/* obtener longitud de dimension 1 -> J */
						qh.addQuad(new Quadruple("PLUS", "ptr", dim.pos.toString(), tmp, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", `stack[${tmp}]`, '', tmp1, OperationType.INT));

						/* obtener i */
						const quad0: Quadruple | undefined = this.array.dimensions[i].generate(qh);

						/* multiplicar i * J */
						const tt2 = qh.getTmp();
						const tt3 = qh.getTmp();
						qh.addQuad(new Quadruple("TIMES", quad0 ? quad0.result : '', tmp1, tt2, OperationType.INT));

						/* obtener j */
						const quad: Quadruple | undefined = this.array.dimensions[i + 1].generate(qh);
						qh.addQuad(new Quadruple("PLUS", tt2, quad ? quad.result : '', tt3, OperationType.INT));
						tt = tt3
					}
				} else {
					const dim = qh.peek().getById(`${this.array.id}[${i + 1}]`);
					const tmp = qh.getTmp();
					const tmp1 = qh.getTmp();
					const tmp2 = qh.getTmp();
					if(dim && dim.pos !== undefined) {
						qh.addQuad(new Quadruple("PLUS", "ptr", dim.pos.toString(), tmp, OperationType.INT));
						qh.addQuad(new Quadruple("ASSIGN", `stack[${tmp}]`, '', tmp1, OperationType.INT));

						qh.addQuad(new Quadruple("TIMES", tt, tmp1, tmp2, OperationType.INT));

						/* obtener siguiente indice */
						const quad: Quadruple | undefined = this.array.dimensions[i + 1].generate(qh);
						const tmp3 = qh.getTmp();
						qh.addQuad(new Quadruple("PLUS", tmp2, quad ? quad.result : '', tmp3, OperationType.INT));
						tt = tmp3;
					}
				}
			}
		} else {
			const quad: Quadruple | undefined = this.array.dimensions[0].generate(qh);
			if(quad) {
				tt = quad.result;
			}
		}

		return tt;
	}


	private getNameStack(type: OperationType) {
		switch(type) {
			case OperationType.INT:
			// case OperationType.BOOL:
			return [`stack_n[ptr_n]`, `ptr_n`, `stack_n`];
			case OperationType.FLOAT:
				return [`stack_f[ptr_f]`, `ptr_f`, `stack_f`];
			// case OperationType.STRING:
			// 	return [`stack_s[ptr_s]`, `ptr_s`, `stack_s`];
			case OperationType.CHAR:
				return [`stack_c[ptr_c]`, `ptr_c`, `stack_c`];
		}
		return [];
	}
}
