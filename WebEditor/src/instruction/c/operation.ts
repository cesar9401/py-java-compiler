import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "./variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { Error, TypeE } from "src/control/error";
import { ArrayAccess } from "src/instruction/c/array_access";
import { FunctionCall } from "src/instruction/c/function_call";
import { Getch } from "src/instruction/c/getch";

export class Operation extends Instruction{
	type: OperationType;
	left?: Operation;
	right?: Operation;
	variable?: Variable;

	function_call?: FunctionCall;
	getch?: Getch;
	array?: ArrayAccess;

	public constructor(line: number, column: number, type: OperationType, variable: Variable);
	public constructor(line: number, column: number, type: OperationType, left: Operation, right?: Operation);
	public constructor(line: number, column: number, function_call: FunctionCall);
	public constructor(getch: Getch);

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
		} else if(args.length === 3) {
			super(args[0], args[1]);
			this.function_call = args[2];
			this.type = OperationType.FUNCTION;
		} else if(args.length === 1){
			super(args[0].line, args[0].column);
			this.getch = args[0];
			this.type = OperationType.FUNCTION;
		} else {
			super(0, 0);
			this.type = OperationType.ARRAY;
		}
	}

	run(table: SymbolTable, sm: SemanticHandler): Variable | undefined {
		// operaciones binarias
		if(this.left && this.right) {
			const left: Variable | undefined = this.left.run(table, sm);
			const right: Variable | undefined = this.right.run(table, sm);
			return sm.op.binaryOperation(this.type, left, right, this.line, this.column);
		}

		// operaciones unarias
		if(this.left) {
			const left: Variable | undefined = this.left.run(table, sm);
			switch(this.type) {
				case OperationType.NOT:
					return new Variable(OperationType.INT, undefined, " ");
				case OperationType.UMINUS:
					if(left) {
						return new Variable(left.type, undefined, " ");
					}
			}
		}

		// valores
		if(this.variable) {
			switch(this.type) {
				case OperationType.STRING:
				case OperationType.INT:
				case OperationType.FLOAT:
					return this.variable;
				case OperationType.CHAR:
					const val1 = '\\n'
					const val2 = '\\t'
					const val3 = '\\\''
					const val4 = '\\\\'

					if(this.variable.value === val1 || this.variable.value === val2 || this.variable.value === val3 || this.variable.value === val4) {
						return this.variable;
					}

					if(this.variable.value?.length !== 1) {
						// error, debe de ser de longitud 1
						const desc = `La variable de tipo char debe de tener una longitud de 1, la longitud ingresada: ${this.variable.value?.length}, no esta permitida.`;
						const error = new Error(this.line, this.column, "", TypeE.SINTACTICO, desc);
						sm.errors.push(error);
						return undefined;
					}
					return this.variable;

				case OperationType.ID:
					if(this.variable.id) {
						const val: Variable | undefined = table.getById(this.variable.id);
						if(val) {
							// console.log(val.value === '');
							if(!val.value) { // if val.value === '', it returns true
								const desc = `La variable con identificador '${this.variable.id}', no tiene un valor definido.`;
								const error = new Error(this.line, this.column, this.variable.id, TypeE.SEMANTICO, desc);
								sm.errors.push(error);
							} else if(val.isArray) {
								/* es un arreglo */
								const desc = `La variable con identificador '${this.variable.id}', corresponde a un arreglo.`;
								const error = new Error(this.line, this.column, this.variable.id, TypeE.SEMANTICO, desc);
								sm.errors.push(error);
								return undefined;
							}
							return val;
						} else {
							const description = `La variable con identificador: '${this.variable.id}', no ha sido declarada.`;
							const error = new Error(this.line, this.column, this.variable.id, TypeE.SEMANTICO, description);
							sm.errors.push(error);
							return undefined;
						}
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

		/* getch */
		if(this.getch) {
			return this.getch.run(table, sm);
		}

		/* arreglo */
		if(this.array) {
			const val = table.getById(this.array.id);
			if(!val) {
				const desc = `La arreglo con identificador '${this.array.id}' no existe.`;
				const error = new Error(this.line, this.column, this.array.id, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
				return;
			}

			if(!val.isArray) {
				const desc = `La variable con identificador '${this.array.id}' no corresponde a una variable de tipo arreglo.`;
				const error = new Error(this.line, this.column, this.array.id, TypeE.SEMANTICO, desc);
				sm.errors.push(error);
				return;
			}

			/* el numero de dimensiones del arreglo no coinciden con las dimensiones declaradas */
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

			return new Variable(val.type, undefined, " ");
		}

		return undefined;
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
						const quad : Quadruple = new Quadruple(this.type, left.result, right.result, result, type);
						qh.addQuad(quad);
						return quad;
					}
				}
			return;
		}

		if(this.left) {
			switch(this.type) {
				case OperationType.UMINUS:
					const left: Quadruple | undefined = this.left.generate(qh);
					const result = qh.getTmp();
					if(left && left.type) {
						const quad = new Quadruple(this.type, left?.result, "", result, left.type);
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
					}
					qh.switch();
					return;
			}

			return;
		}

		if(this.variable) {
			if(this.variable.value) {
				switch(this.type) {
					case OperationType.STRING:
						return new Quadruple(this.type, "", "", `"${this.variable.value}"`, this.type);
					case OperationType.CHAR:
						return new Quadruple(this.type, "", "", `'${this.variable.value}'`, this.type);
					case OperationType.INT:
					case OperationType.FLOAT:
						return new Quadruple(this.type, "", "", this.variable.value, this.type);
				}

			} else if(this.variable.id) {
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
		}

		if(this.function_call) {
			return this.function_call.generate(qh);
		}

		if(this.getch) {
			return this.getch.generate(qh);
		}

		if(this.array) {
			const variable = qh.peek().getById(this.array.id);
			if(variable && variable.pos !== undefined) {
				const stack = this.getNameStack(variable.type);
				let tt = this.getPos(qh);

				const t1 = qh.getTmp();
				const t2 = qh.getTmp(); /* puntero en ptr_n o segun sea el tipo donde inicia el arreglo */
				const t3 = qh.getTmp();
				const t4 = qh.getTmp();
				qh.addQuad(new Quadruple("PLUS", "ptr", variable.pos.toString(), t1, OperationType.INT));
				qh.addQuad(new Quadruple("ASSIGN", `stack[${t1}]`, '', t2, OperationType.INT));
				qh.addQuad(new Quadruple("PLUS", t2, tt, t3, OperationType.INT));
				const arrayQuad = new Quadruple("ASSIGN", `${stack[2]}[${t3}]`, '', t4, variable.type);
				qh.addQuad(arrayQuad);
				return arrayQuad;
			}
		}

		return undefined;
	}

	/* obtener posicion segun arreglo */
	private getPos(qh: QuadHandler) {
		let tt = '';
		if(this.array) {
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
		}

		return tt;
	}

	/* obtener puntero, stack segun tipo de variable */
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

	private getFromStack(qh: QuadHandler, ts: string, variable: Variable): Quadruple {
		switch(variable.type) {
			case OperationType.INT:
				return new Quadruple("ASSIGN", `stack_n[${ts}]`, "", qh.getTmp(), OperationType.INT); // entero
			case OperationType.FLOAT:
				return new Quadruple("ASSIGN", `stack_f[${ts}]`, "", qh.getTmp(), OperationType.FLOAT); // float
			default:
				return new Quadruple("ASSIGN", `stack_c[${ts}]`, "", qh.getTmp(), OperationType.CHAR); // char
		}
	}

	// agregar cuadruples para hijos derecho e izquierdo AND / OR
	private addQuad(op: Operation, quadruple: Quadruple | undefined, qh: QuadHandler): void {
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

	private getType(qh: QuadHandler, type: OperationType, left: Quadruple, right: Quadruple): OperationType | undefined {
		if(left.type && right.type) {
			const varLeft = new Variable(left.type, "", "");
			const varRight = new Variable(right.type, "", "");
			const result: Variable | undefined = qh.getSM.op.binaryOperation(type, varLeft, varRight,0, 0);
			if(result) {
				return result.type;
			}
		}
		return;
	}
}

export enum OperationType {
	INT = "INT",
	DOUBLE = "DOUBLE",
	FLOAT = "FLOAT",
	CHAR = "CHAR",
	STRING = "STRING",
	ID = "ID",
	BOOL = "BOOLEAN",
	VOID = "VOID",

	ARRAY = "ARRAY",
	CLAZZ = "CLASS", /* para una clase */
	FUNCTION = "FUNCTION", /* para una función */

	SUM = "PLUS",
	SUB = "MINUS",
	MUL = "TIMES",
	DIV = "DIVISION",
	UMINUS = "UMINUS",
	POW = "POW",
	MOD = "MOD",

	AND = "AND",
	OR = "OR",
	NOT = "NOT",

	EQEQ = "EQEQ",
	NEQ = "NEQ",
	GREATER = "GREATER",
	GREATER_EQ = "GREATER_EQ",
	SMALLER = "SMALLER",
	SMALLER_EQ = "SMALLER_EQ"
}
