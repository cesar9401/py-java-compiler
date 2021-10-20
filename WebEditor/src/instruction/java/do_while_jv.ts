import { Instruction } from "../instruction";
import { SymbolTable } from "src/table/symbolTable";
import { Quadruple } from "src/table/quadruple";
import { SemanticHandler } from "src/control/semantic_handler";
import { QuadHandler } from "src/control/quad_handler";
import { OperationType } from "src/instruction/c/operation";
import { Variable } from "src/instruction/c/variable";
import { OperationJV } from "./operation_jv";
import { Error, TypeE } from "src/control/error";

export class DoWhileJV extends Instruction {
	operation: OperationJV;
	instructions: Instruction[];

	constructor(line: number, column: number, operation: OperationJV, instructions: Instruction[]) {
		super(line, column);
		this.operation = operation;
		this.instructions = instructions;
	}

	run(table: SymbolTable, sm: SemanticHandler) {
		const val: Variable | undefined = this.operation.run(table, sm);
		if(!val || !val.value) {
			const desc = `En la instruccion 'do-while', la condicion no se puede procesar debido a que uno de los operandos no tiena valor definido o no ha sido declarado.`;
			const error = new Error(this.line, this.column, val && val.id ? val.id : "", TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}

		if(val && val?.type !== OperationType.BOOL) {
			const desc = `En la instruccion 'do-while', se esperaba una condicion(variable de tipo boolean), se encontro una variable de tipo '${val?.type}'.`;
			const error = new Error(this.operation.line, this.operation.column, (val && val.id ? val.id : ""), TypeE.SEMANTICO, desc);
			sm.errors.push(error);
		}

		/* agregar scope do-while */
		sm.push('do-while');
		const local = new SymbolTable(sm.peek(), table);
		sm.pushTable(local);

		for(const instruccion of this.instructions) {
			instruccion.run(local, sm);
		}

		/* eliminar scope do-while */
		sm.pop();
	}

	generate(qh: QuadHandler) {}
}
