import { Instruction } from "src/instruction/instruction";
import { OperationType } from "src/instruction/c/operation";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "src/instruction/c/variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { Error, TypeE } from "src/control/error";

export class OperationJV extends Instruction {
	type: OperationType;
	left?: OperationJV;
	right?: OperationJV;
	variable?: Variable;
	ths: boolean;

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

		return;
	}

	generate(qh: QuadHandler) {}
}
