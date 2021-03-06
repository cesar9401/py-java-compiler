import { Operation, OperationType } from "../c/operation";
import { SymbolTable } from "src/table/symbolTable";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { Instruction } from "src/instruction/instruction";
import { Variable } from "../c/variable";
import { Error, TypeE } from 'src/control/error';
import { Quadruple } from "src/table/quadruple";

export class OperationPY extends Instruction {
	type: OperationType;
	left?: OperationPY;
	right?: OperationPY;
	variable?: Variable;

	public constructor(line: number, column: number, type: OperationType, variable: Variable);
	public constructor(line: number, column: number, type: OperationType, left: OperationPY, right?: OperationPY);

	public constructor(...args: Array<any>) {
		if(args.length === 4) {
			super(args[0], args[1]);
			this.type = args[2];
			this.variable = args[3];
		} else {
			super(args[0], args[1]);
			this.type = args[2];
			this.left = args[3];
			this.right = args[4];
		}
	}

	run(table: SymbolTable, sm: SemanticHandler) : Variable | undefined {
		// operaciones binarias
		if(this.left && this.right) {
			const left: Variable | undefined = this.left.run(table, sm);
			const right: Variable | undefined = this.right.run(table, sm);
			return sm.op.binaryOperationPY(this.type, left, right, this.line, this.column);
		}

		// operaciones unarias
		if(this.left) {
			const left : Variable | undefined = this.left.run(table, sm);
			switch(this.type) {
				case OperationType.NOT:
					return sm.op.notPY(left, this.line, this.column);
				case OperationType.UMINUS:
					return sm.op.uminusPY(left, this.line, this.column);
			}
		}

		// valores
		if(this.variable) {
			switch(this.type) {
				case OperationType.INT:
				case OperationType.STRING:
				case OperationType.FLOAT:
				case OperationType.BOOL:
					return this.variable;

				case OperationType.ID:
					if(this.variable.id) {
						const val: Variable | undefined = table.getById(this.variable.id);
						if(!val) {
							const description = `La variable con identificador: '${this.variable.id}', no ha sido declarada.`;
							const error = new Error(this.line, this.column, this.variable.id, TypeE.SEMANTICO, description);
							sm.errors.push(error);
							return undefined;
						} else {
							if(!val.value) {
								const desc = `La variable con identificador '${this.variable.id}', no tiene un valor definido.`;
								const error = new Error(this.line, this.column, this.variable.id, TypeE.SEMANTICO, desc);
								sm.errors.push(error);
								return undefined;
							}
						}

						return val;
					}
			}
		}

		return;
	}

	generate(qh: QuadHandler): Quadruple | undefined {
		if(this.left && this.right) {
			switch(this.type) {
				case OperationType.GREATER:
				case OperationType.SMALLER:
				case OperationType.GREATER_EQ:
				case OperationType.SMALLER_EQ:
				case OperationType.EQEQ:
				case OperationType.NEQ:
					const left: Quadruple | undefined = this.left.generate(qh);
					const right: Quadruple | undefined = this.right.generate(qh);
					if(left && right) {
						const quad = new Quadruple(`IF_${this.type}`, left.result, right.result, "");
						const goto = new Quadruple('GOTO', "", "", "");

						qh.addTrue(quad);
						qh.addFalse(goto);

						qh.addQuad(quad);
						qh.addQuad(goto);
						return quad;
					}
					return;
				case OperationType.AND:
					const andL = this.left.generate(qh);
					this.addQuad(this.left, andL, qh); // revisar si es id, num, sum, sub, div, mul, mod, pow

					if(qh.labelTrue) {
						qh.toTrue(qh.labelTrue);
						qh.addQuad(new Quadruple("LABEL", "", "", qh.labelTrue));
						qh.labelTrue = undefined;
					} else {
						const lt1 = qh.getLabel();
						qh.toTrue(lt1);
						// agregar label true
						qh.addQuad(new Quadruple("LABEL", "", "", lt1));
					}

					if(qh.labelFalse) {
						qh.toFalse(qh.labelFalse);
					} else {
						qh.labelFalse = qh.getLabel();
						qh.toFalse(qh.labelFalse);
					}

					const andR = this.right.generate(qh);
					this.addQuad(this.right, andR, qh); // revisar si es id, num, sum, sub, div, mul, mod, pow

					return;

				case OperationType.OR:
					const orL = this.left.generate(qh);
					this.addQuad(this.left, orL, qh); // revisar si es id, num, sum, sub, div, mul, mod, pow

					if(qh.labelFalse) {
						qh.toFalse(qh.labelFalse);
						qh.addQuad(new Quadruple("LABEL", "", "", qh.labelFalse));
						qh.labelFalse = undefined;
					} else {
						const lf1 = qh.getLabel();
						qh.toFalse(lf1);
						// agregar label false
						qh.addQuad(new Quadruple("LABEL", "", "", lf1));
					}

					if(qh.labelTrue) {
						qh.toTrue(qh.labelTrue);
					} else {
						qh.labelTrue = qh.getLabel();
						qh.toTrue(qh.labelTrue);
					}

					const orR = this.right.generate(qh);
					this.addQuad(this.right, orR, qh); // revisar si es id, num, sum, sub, div, mul, mod, pow
					return;
			}

			const left: Quadruple | undefined = this.left.generate(qh);
			const right: Quadruple | undefined = this.right.generate(qh);
			const result = qh.getTmp();
			if(left && right) {
				const type = this.getType(qh, this.type, left, right);
				if(type) {
					/* concatenar cadenas */
					if(this.type === OperationType.SUM) {
						// if(left.type === OperationType.STRING && right.type === OperationType.STRING) {

						// 	const len = qh.peek().length;
						// 	const tmp = qh.getTmp();
						// 	const t1 = qh.getTmp();
						// 	const t2 = qh.getTmp();

						// 	const t3 = qh.getTmp();
						// 	const t4 = qh.getTmp();
						// 	const result = qh.getTmp();
						// 	/* puntero hacia la pila de __concat__ */
						// 	qh.addQuad(new Quadruple("PLUS", "ptr", len.toString(), tmp, OperationType.INT));

						// 	/* primer string */
						// 	qh.addQuad(new Quadruple("ASSIGN", left.result, "", "stack_s[ptr_s]"));
						// 	qh.addQuad(new Quadruple("PLUS", `${tmp}`, "0", t1, OperationType.INT));
						// 	qh.addQuad(new Quadruple("ASSIGN", "ptr_s", "", `stack[${t1}]`));
						// 	qh.addQuad(new Quadruple("PLUS", "ptr_s", "1", "ptr_s"));

						// 	/* segundo string */
						// 	qh.addQuad(new Quadruple("ASSIGN", right.result, "", "stack_s[ptr_s]"));
						// 	qh.addQuad(new Quadruple("PLUS", `${tmp}`, "1", t2, OperationType.INT));
						// 	qh.addQuad(new Quadruple("ASSIGN", "ptr_s", "", `stack[${t2}]`));
						// 	qh.addQuad(new Quadruple("PLUS", "ptr_s", "1", "ptr_s"));

						// 	qh.addQuad(new Quadruple("PLUS", "ptr", len.toString(), "ptr"));
						// 	qh.addQuad(new Quadruple("FUNCTION", "", "", '__concat__'));

						// 	qh.addQuad(new Quadruple("PLUS", "ptr", "2", t3, OperationType.INT));
						// 	qh.addQuad(new Quadruple("ASSIGN", `stack[${t3}]`, "", t4, OperationType.INT));
						// 	qh.addQuad(new Quadruple("ASSIGN", `stack_s[${t4}]`, '', result, type));

						// 	/* recuperar puntero despues de ejecucion de __concat__ */
						// 	qh.addQuad(new Quadruple("MINUS", "ptr", len.toString(), "ptr"));

						// 	// enviar resultado
						// 	return new Quadruple(this.type, "", "", `${result}`, type);
						// } else
						if(left.type === OperationType.STRING || right.type === OperationType.STRING) {
							const len = qh.peek().length;
							const tmp = qh.getTmp();
							const t1 = qh.getTmp();
							const t2 = qh.getTmp();

							const t3 = qh.getTmp();
							const t4 = qh.getTmp();
							const result = qh.getTmp();
							/* puntero hacia la pila de __concat__ */
							qh.addQuad(new Quadruple("PLUS", "ptr", len.toString(), tmp, OperationType.INT));

							/* primer string */
							if(left.type === OperationType.INT) {
								/* convertir entero a string */
								const t = qh.getTmp();
								qh.addQuad(new Quadruple("ARRAY", "", "", `${t}[12]`, OperationType.CHAR)); // crear char tmp[12];
								qh.addQuad(new Quadruple("SPRINTF", `${t}`, `"%d"`, `${left.result}`));
								qh.addQuad(new Quadruple("ASSIGN", t, "", "stack_s[ptr_s]"));
							} else if(left.type === OperationType.FLOAT) {
								const t = qh.getTmp();
								qh.addQuad(new Quadruple("ARRAY", "", "", `${t}[25]`, OperationType.CHAR)); // crear char tmp[25];
								qh.addQuad(new Quadruple("SPRINTF", `${t}`, `"%f"`, `${left.result}`));
								qh.addQuad(new Quadruple("ASSIGN", t, "", "stack_s[ptr_s]"));
							} else if(left.type === OperationType.BOOL) {
								const lt = qh.getLabel();
								const lf = qh.getLabel();
								const f = qh.getLabel();
								qh.addQuad(new Quadruple(`IF_GREATER`, left.result, "0", lt));
								qh.addQuad(new Quadruple('GOTO', "", "", lf));
								qh.addQuad(new Quadruple("LABEL", "", "", lt));
								qh.addQuad(new Quadruple("ASSIGN", `"True"`, "", "stack_s[ptr_s]")); /* asignar true */
								// qh.addQuad(new Quadruple("PRINTF", "%s", `"True"`, ""));
								qh.addQuad(new Quadruple('GOTO', "", "", f));
								qh.addQuad(new Quadruple("LABEL", "", "", lf));
								qh.addQuad(new Quadruple("ASSIGN", `"False"`, "", "stack_s[ptr_s]")); /* asignar false */
								// qh.addQuad(new Quadruple("PRINTF", "%s", `"False"`, ""));
								qh.addQuad(new Quadruple("LABEL", "", "", f));
							} else {
								qh.addQuad(new Quadruple("ASSIGN", left.result, "", "stack_s[ptr_s]"));
							}

							qh.addQuad(new Quadruple("PLUS", `${tmp}`, "0", t1, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "ptr_s", "", `stack[${t1}]`));
							qh.addQuad(new Quadruple("PLUS", "ptr_s", "1", "ptr_s"));
							/* primer string */

							/* segundo string */
							if(right.type === OperationType.INT) {
								const t = qh.getTmp();
								qh.addQuad(new Quadruple("ARRAY", "", "", `${t}[12]`, OperationType.CHAR)); // crear char tmp[12];
								qh.addQuad(new Quadruple("SPRINTF", `${t}`, `"%d"`, `${right.result}`));
								qh.addQuad(new Quadruple("ASSIGN", t, "", "stack_s[ptr_s]"));
							} else if(right.type === OperationType.FLOAT) {
								const t = qh.getTmp();
								qh.addQuad(new Quadruple("ARRAY", "", "", `${t}[25]`, OperationType.CHAR)); // crear char tmp[25];
								qh.addQuad(new Quadruple("SPRINTF", `${t}`, `"%f"`, `${right.result}`));
								qh.addQuad(new Quadruple("ASSIGN", t, "", "stack_s[ptr_s]"));
							} else if(right.type === OperationType.BOOL) {
								const lt = qh.getLabel();
								const lf = qh.getLabel();
								const f = qh.getLabel();
								qh.addQuad(new Quadruple(`IF_GREATER`, right.result, "0", lt));
								qh.addQuad(new Quadruple('GOTO', "", "", lf));
								qh.addQuad(new Quadruple("LABEL", "", "", lt));
								qh.addQuad(new Quadruple("ASSIGN", `"True"`, "", "stack_s[ptr_s]")); /* asignar true */
								// qh.addQuad(new Quadruple("PRINTF", "%s", `"True"`, ""));
								qh.addQuad(new Quadruple('GOTO', "", "", f));
								qh.addQuad(new Quadruple("LABEL", "", "", lf));
								qh.addQuad(new Quadruple("ASSIGN", `"False"`, "", "stack_s[ptr_s]")); /* asignar false */
								// qh.addQuad(new Quadruple("PRINTF", "%s", `"False"`, ""));
								qh.addQuad(new Quadruple("LABEL", "", "", f));
							} else {
								qh.addQuad(new Quadruple("ASSIGN", right.result, "", "stack_s[ptr_s]"));
							}
							qh.addQuad(new Quadruple("PLUS", `${tmp}`, "1", t2, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", "ptr_s", "", `stack[${t2}]`));
							qh.addQuad(new Quadruple("PLUS", "ptr_s", "1", "ptr_s"));
							/* segundo string */

							/* dirigir puntero hacia ejecucion de __concat__ */
							qh.addQuad(new Quadruple("PLUS", "ptr", len.toString(), "ptr"));
							qh.addQuad(new Quadruple("FUNCTION", "", "", '__concat__'));

							qh.addQuad(new Quadruple("PLUS", "ptr", "2", t3, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", `stack[${t3}]`, "", t4, OperationType.INT));
							qh.addQuad(new Quadruple("ASSIGN", `stack_s[${t4}]`, '', result, type));

							/* recuperar puntero despues de ejecucion de __concat__ */
							qh.addQuad(new Quadruple("MINUS", "ptr", len.toString(), "ptr"));

							// enviar resultado
							return new Quadruple(this.type, "", "", `${result}`, type);
						}
					}

					if(this.type === OperationType.DIV) {
						left.type = OperationType.FLOAT;
						right.type = OperationType.FLOAT;
					}
					const quad : Quadruple = new Quadruple(this.type, left.result, right.result, result, type);
					qh.addQuad(quad);
					return quad;
				}
			}
		}

		if(this.left) {
			switch(this.type) {
				case OperationType.UMINUS:
					const left: Quadruple | undefined = this.left.generate(qh);
					const result = qh.getTmp();
					if(left && left.type) {
						const quad = new Quadruple(this.type, left.result, "", result, left.type);
						qh.addQuad(quad);
						return quad;
					}
					return;
				case OperationType.NOT:
					const left1 = this.left.generate(qh);
					switch(this.left.type) {
						case OperationType.INT:
						case OperationType.FLOAT:
						case OperationType.CHAR:
						case OperationType.ID:
						case OperationType.SUM:
						case OperationType.SUB:
						case OperationType.MUL:
						case OperationType.DIV:
						case OperationType.MOD:
						case OperationType.POW:
						case OperationType.UMINUS:
						case OperationType.BOOL: // boleanos
							// write your code here
							if(left1) {
								const quad = new Quadruple(`IF_GREATER`, left1.result, "0", "");
								const goto = new Quadruple('GOTO', "", "", "");

								qh.addTrue(quad);
								qh.addFalse(goto);

								qh.addQuad(quad);
								qh.addQuad(goto);
							}
							break;

						/* revisar que longitud sea mayor que cero y luego negar resultado */
						case OperationType.STRING:
					}
					qh.switch();
					return;
			}
		}

		if(this.variable) {
			switch(this.type) {
				case OperationType.INT:
				case OperationType.FLOAT:
					return new Quadruple(this.type, "", "", `${this.variable.value}`, this.type)
				case OperationType.BOOL:
					return new Quadruple(this.type, "", "", `${this.variable.value === 'True' ? '1' : '0'}`, this.type);
				case OperationType.STRING:
					return new Quadruple(this.type, "", "", `"${this.variable.value}"`, this.type);
				case OperationType.ID:
					if(this.variable.id) {
						const variable = qh.peek().getById(this.variable.id);
						if(variable && variable.pos !== undefined) {
							const t = qh.getTmp();
							const ts = qh.getTmp();
							const ptr = new Quadruple("PLUS", "ptr", variable.pos.toString(), t, OperationType.INT);
							const assign = new Quadruple("ASSIGN", `stack[${t}]`, "", ts, OperationType.INT);
							const dest = this.getFromStack(qh, ts, variable);

							qh.addQuad(ptr);
							qh.addQuad(assign);
							qh.addQuad(dest);
							return dest;
						}
					}
					return;
			}
		}

		return undefined;
	}

	// agregar cuadruples para hijos derecho e izquierdo AND / OR
	private addQuad(op: OperationPY, quadruple: Quadruple | undefined, qh: QuadHandler): void {
		switch(op.type) {
			case OperationType.INT:
			case OperationType.FLOAT:
			case OperationType.CHAR:
			case OperationType.ID:
			case OperationType.SUM:
			case OperationType.SUB:
			case OperationType.MUL:
			case OperationType.DIV:
			case OperationType.MOD:
			case OperationType.POW:
			case OperationType.UMINUS:
			case OperationType.BOOL: // boleanos
			case OperationType.STRING: // string
				if(quadruple) {
					const quad = new Quadruple(`IF_GREATER`, quadruple.result, "0", "");
					const goto = new Quadruple('GOTO', "", "", "");

					qh.addTrue(quad);
					qh.addFalse(goto);

					qh.addQuad(quad);
					qh.addQuad(goto);
				}
				break;
		}
	}

	private getFromStack(qh: QuadHandler, ts: string, variable: Variable) : Quadruple {
		switch(variable.type) {
			case OperationType.INT:
				return new Quadruple("ASSIGN", `stack_n[${ts}]`, "", qh.getTmp(), OperationType.INT); // entero
			case OperationType.BOOL:
				return new Quadruple("ASSIGN", `stack_n[${ts}]`, "", qh.getTmp(), OperationType.BOOL); // booleano
			case OperationType.STRING:
				return new Quadruple("ASSIGN", `stack_s[${ts}]`, "", qh.getTmp(), OperationType.STRING); // string
			default:
			// case OperationType.FLOAT:
				return new Quadruple("ASSIGN", `stack_f[${ts}]`, "", qh.getTmp(), OperationType.FLOAT); // float
		}
	}

	private getType(qh: QuadHandler, type: OperationType, left: Quadruple, right: Quadruple): OperationType | undefined {
		if(left.type && right.type) {
			const varLeft = new Variable(left.type, "", "");
			const varRight = new Variable(right.type, "", "");
			const result: Variable | undefined = qh.getSM.op.binaryOperationPY(type, varLeft, varRight,0, 0);
			if(result) {
				return result.type;
			}
		}
		return;
	}
}
