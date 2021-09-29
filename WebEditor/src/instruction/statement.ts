import { Instruction } from "./instruction";
import { Variable } from './variable';
import { OperationType } from "./operation";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";

export class Statement extends Instruction {
	cnst: boolean;
	type: OperationType;
	id: string;
	operation?: Instruction

	constructor(
		line: number,
		column: number,
		cnst: boolean,
		type: OperationType,
		id: string,
		operation?: Instruction
	) {
		super(line, column);
		this.cnst = cnst;
		this.type = type;
		this.id = id;
		this.operation = operation;
	}

	run(table: SymbolTable) {
		const value: Variable = this.operation?.run(table);
		if(value) {
			if(value.type === this.type) {
				value.cnst = this.cnst;
				value.id = this.id;
				if(!table.contains(this.id)) {
					console.log(`Asignando ${value.id}`);
					table.add(value);
				} else {
					console.log(`Ya existe variable ${this.id}`);
				}
			} else {
				console.log(`no son del mismo tipo ${this.id}`);
			}
		} else {
			console.log(`No tiene valor definido en asignacion`);
		}
	}

	generate(quads: Quadruple[]) {
	}
}