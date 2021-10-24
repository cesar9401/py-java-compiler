import { Instruction } from "src/instruction/instruction";
import { OperationType } from "src/instruction/c/operation";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "src/instruction/c/variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { Error, TypeE } from "src/control/error";
import { FunctionCallJV } from "./function_call_jv";

export class OperationJV extends Instruction {
	type: OperationType;
	left?: OperationJV;
	right?: OperationJV;
	variable?: Variable;
	ths: boolean;

	function_call?: FunctionCallJV;

	public constructor(line: number, column: number, type: OperationType, variable: Variable);
	public constructor(line: number, column: number, type: OperationType, left: OperationJV, right?: OperationJV);
	public constructor(line: number, column: number, function_call: FunctionCallJV);

	public constructor(...args: Array<any>) {
		if(args.length === 4) {
			super(args[0], args[1]);
			this.type = args[2];
			this.variable = args[3];
		} else if(args.length === 5) {
			super(args[0], args[1]);
			this.type = args[2];
			this.left = args[3];
			this.right = args[4];
		} else {
			super(args[0], args[1]);
			this.function_call = args[2];
			this.type = OperationType.FUNCTION;
		}

		/* para casos this.id */
		this.ths = false;
	}

	run(table: SymbolTable, sm: SemanticHandler): Variable | undefined {
		/* operaciones binarias */
		if(this.left && this.right) {
			const left: Variable | undefined = this.left.run(table, sm);
			const right: Variable | undefined = this.right.run(table, sm);
			return sm.op.binaryOperationJV(this.type, left, right, this.line, this.column);
		}

		/* operaciones unarias */
		if(this.left) {
			const left: Variable | undefined = this.left.run(table, sm);
			switch(this.type) {
				case OperationType.NOT:
					return sm.op.notJV(left, this.line, this.column);
				case OperationType.UMINUS:
					return sm.op.uminusJV(left, this.line, this.column);
			}
		}

		/* valores */
		if(this.variable) {
			switch(this.type) {
				case OperationType.INT:
				case OperationType.STRING:
				case OperationType.FLOAT:
				case OperationType.BOOL:
					return this.variable;

				case OperationType.CHAR:
					const val1 = '\\n';
					const val2 = '\\t';
					const val3 = '\\\'';
					const val4 = '\\\\';

					if(this.variable.value === val1 || this.variable.value === val2 || this.variable.value === val3 || this.variable.value === val4) {
						return this.variable;
					}

					/* char debe ser de longitud 1 */
					if(this.variable.value?.length !== 1) {
						const desc = `La variable de tipo char debe de tener una longitud de 1, la longitud ingresada: ${this.variable.value?.length}, no esta permitida.`;
						const error = new Error(this.line, this.column, "", TypeE.SINTACTICO, desc);
						sm.errors.push(error);
						return undefined;
					}

					return this.variable;

				case OperationType.ID:
					if(this.variable.id) {
						let val;
						/* verificar si es this.id */
						if(this.ths && sm.getClassTable) {
							val = sm.getClassTable.getById(this.variable.id);
						} else {
							val = table.getById(this.variable.id);
							if(!val) {
								val = sm.getClassTable?.getById(this.variable.id);
							}
						}

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

		/* funcion */
		if(this.function_call) {
			const value: Variable | undefined = this.function_call.run(table, sm);
			if(!value) {
				if(!this.function_call.getMethod) {
					return;
				}

				const desc = `La funcion que intenta invocar: '${this.function_call.id}', no devuelve ningun tipo de valor(funcion de tipo void).`;
				const error = new Error(this.function_call.line, this.function_call.column, this.function_call.id, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
				return;
			}
			return value;
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
					this.addQuad(this.left, andL, qh); /* en caso de ser booleanos */

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
					this.addQuad(this.right, andR, qh); /* en caso de ser booleanos */

					return;

				case OperationType.OR:
					const orL = this.left.generate(qh);
					this.addQuad(this.left, orL, qh); /* en caso de ser booleanos */

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
					this.addQuad(this.right, orR, qh); /* en caso de ser booleanos */
					return;
			}

			const left: Quadruple | undefined = this.left.generate(qh);
			const right: Quadruple | undefined = this.right.generate(qh);
			const result = qh.getTmp();
			if(left && right) {
				const type = this.getType(qh, this.type, left, right);
				if(type) {
					if(this.type === OperationType.SUM) {
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
								qh.addQuad(new Quadruple("ASSIGN", `"true"`, "", "stack_s[ptr_s]")); /* asignar true */
								// qh.addQuad(new Quadruple("PRINTF", "%s", `"True"`, ""));
								qh.addQuad(new Quadruple('GOTO', "", "", f));
								qh.addQuad(new Quadruple("LABEL", "", "", lf));
								qh.addQuad(new Quadruple("ASSIGN", `"false"`, "", "stack_s[ptr_s]")); /* asignar false */
								// qh.addQuad(new Quadruple("PRINTF", "%s", `"False"`, ""));
								qh.addQuad(new Quadruple("LABEL", "", "", f));
							} else if (left.type === OperationType.CHAR) {
								/* convertir caracter a string */
								const t = qh.getTmp();
								qh.addQuad(new Quadruple("ARRAY", "", "", `${t}[2]`, OperationType.CHAR)); // crear char tmp[2];
								qh.addQuad(new Quadruple("SPRINTF", `${t}`, `"%c"`, `${left.result}`)); // verificar si se puede hacer stack_s[ptr_s] = left.result
								qh.addQuad(new Quadruple("ASSIGN", t, "", "stack_s[ptr_s]"));
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
								qh.addQuad(new Quadruple("ASSIGN", `"true"`, "", "stack_s[ptr_s]")); /* asignar true */
								// qh.addQuad(new Quadruple("PRINTF", "%s", `"True"`, ""));
								qh.addQuad(new Quadruple('GOTO', "", "", f));
								qh.addQuad(new Quadruple("LABEL", "", "", lf));
								qh.addQuad(new Quadruple("ASSIGN", `"false"`, "", "stack_s[ptr_s]")); /* asignar false */
								// qh.addQuad(new Quadruple("PRINTF", "%s", `"False"`, ""));
								qh.addQuad(new Quadruple("LABEL", "", "", f));
							} else if(right.type === OperationType.CHAR) {
								/* convertir caracter a string */
								const t = qh.getTmp();
								qh.addQuad(new Quadruple("ARRAY", "", "", `${t}[2]`, OperationType.CHAR)); // crear char tmp[2];
								qh.addQuad(new Quadruple("SPRINTF", `${t}`, `"%c"`, `${left.result}`)); // verificar si se puede hacer stack_s[ptr_s] = left.result
								qh.addQuad(new Quadruple("ASSIGN", t, "", "stack_s[ptr_s]"));
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

					const quad: Quadruple = new Quadruple(this.type, left.result, right.result, result, type);
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
					if(left1 && left1.type === OperationType.BOOL) {
						const quad = new Quadruple(`IF_GREATER`, left1.result, "0", "");
						const goto = new Quadruple('GOTO', "", "", "");

						qh.addTrue(quad);
						qh.addFalse(goto);

						qh.addQuad(quad);
						qh.addQuad(goto);
					}
					qh.switch();
					return;
			}
		}

		if(this.variable) {
			switch(this.type) {
				case OperationType.CHAR:
					return new Quadruple(this.type, "", "", `'${this.variable.value}'`, this.type);
				case OperationType.INT:
				case OperationType.FLOAT:
					return new Quadruple(this.type, "", "", `${this.variable.value}`, this.type)
				case OperationType.BOOL:
					return new Quadruple(this.type, "", "", `${this.variable.value === 'true' ? '1' : '0'}`, this.type);
				case OperationType.STRING:
					return new Quadruple(this.type, "", "", `"${this.variable.value}"`, this.type);
				case OperationType.ID:
					if(this.variable.id) {
						let variable;
						if(this.ths && qh.getSM.getClassTable) {
							/* buscar en la tabla de la clase */
							variable = qh.getSM.getClassTable.getById(this.variable.id);
							if(variable) {
								return this.getFromHeap(qh, variable);
							}
						} else {
							/* buscar en tabla local */
							variable = qh.peek().getById(this.variable.id);
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
							} else {
								/* buscar en tabla de la clase */
								variable = qh.getSM.getClassTable?.getById(this.variable.id);
								if(variable) {
									return this.getFromHeap(qh, variable);
								}
							}
						}
					}
			}
		}

		if(this.function_call) {
			return this.function_call.generate(qh);
		}

		return undefined;
	}

	private getFromHeap(qh: QuadHandler, variable: Variable): Quadruple | undefined {
		if(variable.pos !== undefined) {
			const t1 = qh.getTmp();
			const t2 = qh.getTmp();
			const t3 = qh.getTmp();
			const t4 = qh.getTmp();
			qh.addQuad(new Quadruple("PLUS", "ptr", "0", t1, OperationType.INT)); // obtener referencia del objeto actual en el heap, almacenado en el stack
			qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, '', t2, OperationType.INT)); // posicion del objeto en heap
			qh.addQuad(new Quadruple("PLUS", t2, variable.pos.toString(), t3, OperationType.INT)); // posicion de la variable en heap
			qh.addQuad(new Quadruple("ASSIGN", `heap[${t3}]`, '', t4, OperationType.INT)); // posicion en arreglo segun tipo
			const dest = this.getFromStack(qh, t4, variable); // elemento obtenido en su respectivo stack/arreglo
			qh.addQuad(dest);
			return dest;
		}
		return;
	}

	private getFromStack(qh: QuadHandler, ts: string, variable: Variable) : Quadruple {
		switch(variable.type) {
			case OperationType.INT:
				return new Quadruple("ASSIGN", `stack_n[${ts}]`, "", qh.getTmp(), OperationType.INT); // entero
			case OperationType.BOOL:
				return new Quadruple("ASSIGN", `stack_n[${ts}]`, "", qh.getTmp(), OperationType.BOOL); // booleano
			case OperationType.STRING:
				return new Quadruple("ASSIGN", `stack_s[${ts}]`, "", qh.getTmp(), OperationType.STRING); // string
			case OperationType.FLOAT:
				return new Quadruple("ASSIGN", `stack_f[${ts}]`, "", qh.getTmp(), OperationType.FLOAT); // float
			default:
			// case OperationType.CHAR:
				return new Quadruple("ASSIGN", `stack_c[${ts}]`, "", qh.getTmp(), OperationType.CHAR); // char
		}
	}

	// agregar cuadruples para hijos derecho e izquierdo AND / OR
	private addQuad(op: OperationJV, quadruple: Quadruple | undefined, qh: QuadHandler):void {
		switch(op.type) {
			case OperationType.BOOL:
			case OperationType.ID:
			if(quadruple) {
				const quad = new Quadruple(`IF_GREATER`, quadruple.result, "0", "");
				const goto = new Quadruple('GOTO', "", "", "");

				qh.addTrue(quad);
				qh.addFalse(goto);

				qh.addQuad(quad);
				qh.addQuad(goto);
			}
		}
	}

	/* obtener tipo de variable al realizar una operacion entre dos operadores */
	private getType(qh: QuadHandler, type: OperationType, left: Quadruple, right: Quadruple): OperationType | undefined {
		if(left.type && right.type) {
			const varLeft = new Variable(left.type, "", "");
			const varRight = new Variable(right.type, "", "");
			const result: Variable | undefined = qh.getSM.op.binaryOperationJV(type, varLeft, varRight, 0, 0);
			if(result) {
				return result.type;
			}
		}
		return;
	}
}
