import { Instruction } from "./instruction";
import { Variable } from './variable';
import { OperationType } from "./operation";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from "src/control/error";

export class Value extends Instruction {
	type: OperationType;
	variable: Variable

	constructor(line: number, column: number, type: OperationType, variable: Variable) {
		super(line, column);
		this.type = type;
		this.variable = variable;
	}

	run(table: SymbolTable, sm: SemanticHandler): Variable | undefined {
		switch(this.type) {
			case OperationType.INT:
			case OperationType.FLOAT:
			case OperationType.CHAR:
				return this.variable;

			case OperationType.ID:
				if(this.variable.id) {
					const val: Variable | undefined = table.getById(this.variable.id);
					if(val) {
						// console.log(val.value === '');
						if(!val.value) {
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

		return undefined;
	}

	generate(quads: Quadruple[]): Quadruple | undefined {
		if(this.variable.value) {
			const result = "t" + (quads.length + 1);
			const quad = new Quadruple(this.type, this.variable.value, "", result);
			quads.push(quad);

			return quad;
		}

		return undefined;
	}
}
