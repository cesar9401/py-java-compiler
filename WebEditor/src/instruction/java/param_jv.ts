import { Instruction } from "src/instruction/instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Variable } from "src/instruction/c/variable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { Error, TypeE } from 'src/control/error';
import { QuadHandler } from "src/control/quad_handler";
import { OperationType } from "src/instruction/c/operation";
import { OperationJV } from "./operation_jv";

export class ParamJV extends Instruction {
	type: OperationType;
	id: string;

	constructor(line: number, column: number, type: OperationType, id: string) {
		super(line, column);
		this.type = type;
		this.id = id;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		/* error la variable ya existe */
		if(table.contains(this.id)) {
			const desc = `Se esta intentando agregar como parametro a la variable '${this.id}' que ya existe como parametro, intente con otro identificador.`;
			const error = new Error(this.line, this.column, this.id, TypeE.SEMANTICO, desc);
			sm.errors.push(error);
			return;
		}

		const val = new Variable(this.type, this.id, ' ');
		table.add(val);
	}

	generate(qh: QuadHandler) {}
}
