import { Instruction } from "./instruction";
import { Variable } from './variable';
import { OperationType } from "./operation";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";

export class Value extends Instruction {
	type: OperationType;
	variable: Variable

	constructor(line: number, column: number, type: OperationType, variable: Variable) {
		super(line, column);
		this.type = type;
		this.variable = variable;
	}

	run(table: SymbolTable): Variable | undefined {
		switch(this.type) {
			case OperationType.INT:
			case OperationType.FLOAT:
			case OperationType.CHAR:
				return this.variable;
		}
		return undefined;
	}

	generate(quads: Quadruple[]) {
	}
}
