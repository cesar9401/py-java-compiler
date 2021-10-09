import { Instruction } from "./instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "./variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { Error, TypeE } from "src/control/error";

export class Operation extends Instruction{
	type: OperationType;
	left?: Operation;
	right?: Operation;
	variable?: Variable;

	public constructor(line: number, column: number, type: OperationType, variable: Variable);
	public constructor(line: number, column: number, type: OperationType, left: Operation, right?: Operation);

	public constructor(...args: Array<any>) {
		if(args.length === 4) {
			super(args[0], args[1]);
			this.type = args[2];
			this.variable = args[3];

			return;
		} else {
			super(args[0], args[1]);
			this.type = args[2];
			this.left = args[3];
			this.right = args[4];

			return;
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
				case OperationType.INT:
				case OperationType.FLOAT:
					return this.variable;
				case OperationType.CHAR:
					if(this.variable.value?.length !== 1) {
						// error, debe de ser de longitud 1
						if(this.variable.value) { // this.variable.value siempre existe.
							const desc = `La variable de tipo char debe de tener una longitud de 1, la longitud ingresada: ${this.variable.value?.length}, no esta permitida.`;
							const error = new Error(this.line, this.column, this.variable.value, TypeE.SINTACTICO, desc);
							sm.errors.push(error);
						}
						return undefined;
					}
					return this.variable;

				case OperationType.ID:
					if(this.variable.id) {
						const val: Variable | undefined = table.getById(this.variable.id);
						if(val) {
							// console.log(val.value === '');
							if(!val.value) { // if val.value === '', it returns true
								// console.log(val.value);
								const desc = `La variable con identificador '${this.variable.id}', no tiene un valor definido.`;
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
					case OperationType.CHAR:
						return new Quadruple(this.type, "", "", `'${this.variable.value}'`, this.type);
					case OperationType.INT:
					case OperationType.FLOAT:
					return new Quadruple(this.type, "", "", this.variable.value, this.type);
				}

				// revisar esto
				const result = qh.getTmp();
				const quad = new Quadruple(this.type, this.variable.value, "", result, this.type);
				qh.addQuad(quad);
				return quad;

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

		return undefined;
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
