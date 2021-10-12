import { OperationType } from "../c/operation";
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

			const left: Quadruple | undefined = this.left.generate(qh);
			const right: Quadruple | undefined = this.right.generate(qh);
			const result = qh.getTmp();
			if(left && right) {
				const type = this.getType(qh, this.type, left, right);
				if(type) {
					if(this.type === OperationType.DIV) {
						left.type = OperationType.FLOAT;
						right.type = OperationType.FLOAT;
					}
					console.log(left, right);
					const quad : Quadruple = new Quadruple(this.type, left.result, right.result, result, type);
					qh.addQuad(quad);
					return quad;
				}
			}
		}

		if(this.left) {}

		if(this.variable) {
			switch(this.type) {
				case  OperationType.INT:
				case OperationType.FLOAT:
					return new Quadruple(this.type, "", "", `${this.variable.value}`, this.type)
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

	private getFromStack(qh: QuadHandler, ts: string, variable: Variable) : Quadruple {
		switch(variable.type) {
			case OperationType.INT:
				return new Quadruple("ASSIGN", `stack_n[${ts}]`, "", qh.getTmp(), OperationType.INT); // entero
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
